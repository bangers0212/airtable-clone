import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type JsonValue } from "@prisma/client/runtime/library";
import { ColumnType, type Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";

export const tableRouter = createTRPCRouter({
  // procedure for initial load of tables
  // called when user opens the table
  getTableInfo: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.table.findUnique({
        where: { id: input.tableId },
        select: {
          id: true,
          name: true,
          columns: {
            orderBy: { position: "asc" },
          },
        },
      });
    }),
  // procedure for fetching rows
  // offset and limit for pagination
  getRowsForTable: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        limit: z.number().optional().default(300),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const take = input.limit + 1;

      const rows = await ctx.db.tableRow.findMany({
        where: { tableId: input.tableId },
        orderBy: { position: "asc" },
        cursor:
          input.cursor == null
            ? undefined
            : {
                tableId_position: {
                  tableId: input.tableId,
                  position: input.cursor,
                },
              },
        take,
      });

      let nextCursor: number | undefined;
      if (rows.length > input.limit) {
        const last = rows.pop()!;
        nextCursor = last.position;
      }
      return { rows, nextCursor };
    }),
  seedRows: protectedProcedure
    .input(z.object({ tableId: z.string(), count: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { tableId, count } = input;

      const [table, cols] = await Promise.all([
        ctx.db.table.findUnique({
          where: { id: tableId },
          select: { nextRowPos: true },
        }),
        ctx.db.tableColumn.findMany({
          where: { tableId },
          select: { key: true, type: true },
          orderBy: { position: "asc" },
        }),
      ]);

      if (!table) throw new Error("table not found");

      const startPos = table.nextRowPos ?? 0;

      const rowsData: Prisma.TableRowCreateManyInput[] = Array.from(
        { length: count },
        (_, i) => {
          const position = startPos + i;

          const rowJson: Prisma.JsonObject = {};
          for (const c of cols) {
            if (c.type === ColumnType.NUMBER) {
              rowJson[c.key] = faker.number.int({ min: 0, max: 999 });
            } else {
              rowJson[c.key] = faker.lorem.sentence();
            }
          }

          return {
            tableId,
            position,
            data: rowJson,
          };
        },
      );

      await ctx.db.tableRow.createMany({
        data: rowsData,
      });

      await ctx.db.table.update({
        where: { id: tableId },
        data: { nextRowPos: startPos + count },
      });
    }),

  createTable: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // column data
      const seedColumns: Array<
        Omit<Prisma.TableColumnCreateManyInput, "tableId" | "position">
      > = [
        { name: "Name", key: "name", type: ColumnType.TEXT },
        { name: "Notes", key: "notes", type: ColumnType.TEXT },
        { name: "Assignee", key: "assignee", type: ColumnType.TEXT },
        { name: "Status", key: "status", type: ColumnType.NUMBER },
        { name: "Attachments", key: "attachments", type: ColumnType.TEXT },
        {
          name: "Attachments Summary",
          key: "attachment_summary",
          type: ColumnType.TEXT,
        },
      ];

      const table = await ctx.db.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
          where: { id: input.projectId },
          include: { tables: true },
        });

        if (!project) throw new Error("project not found");
        const nextTableNumber = project.tables.length + 1;

        const table = await tx.table.create({
          data: {
            projectId: input.projectId,
            name: `Table ${nextTableNumber}`,
          },
        });

        await tx.tableColumn.createMany({
          data: seedColumns.map((c, i) => ({
            tableId: table.id,
            name: c.name,
            key: c.key,
            type: c.type,
            position: i,
          })),
        });

        return table;
      });

      const seedRowsCount = 350;
      const rowsData = Array.from({ length: seedRowsCount }).map((_, i) => ({
        tableId: table.id,
        position: i,
        data: {
          name: faker.person.fullName(),
          notes: faker.lorem.sentence(),
          assignee: faker.person.fullName(),
          status: faker.number.int({ min: 0, max: 999 }),
          attachments: faker.lorem.sentence(),
          attachment_summary: faker.lorem.sentence(),
        },
      }));
      await ctx.db.tableRow.createMany({ data: rowsData });

      await ctx.db.table.update({
        where: { id: table.id },
        data: { nextColPos: seedColumns.length, nextRowPos: seedRowsCount },
      });

      return table;
    }),
  updateRowData: protectedProcedure
    .input(
      z.object({
        rowId: z.string(),
        key: z.string(),
        value: z.union([z.string(), z.number(), z.null()]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { rowId, key, value } = input;

      const row = await ctx.db.tableRow.findUnique({
        where: { id: rowId },
        select: { data: true },
      });

      if (!row) throw new Error("Row not found.");

      const updatedData = {
        ...(row.data as Record<string, JsonValue>),
        [key]: value,
      };

      return ctx.db.tableRow.update({
        where: { id: rowId },
        data: { data: updatedData },
      });
    }),
  addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string(),
        type: z.nativeEnum(ColumnType),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // check duplicate
        const existingColumn = await tx.tableColumn.findFirst({
          where: {
            tableId: input.tableId,
            name: input.name,
          },
        });

        if (existingColumn) {
          throw new Error("A column with this name already exists.");
        }

        // update table
        const updatedTable = await tx.table.update({
          where: { id: input.tableId },
          data: { nextColPos: { increment: 1 } },
          select: { nextColPos: true },
        });

        const position = updatedTable.nextColPos - 1;

        // create column
        const newColumn = await tx.tableColumn.create({
          data: {
            tableId: input.tableId,
            name: input.name,
            key: input.name,
            type: input.type,
            position,
          },
        });

        // row data
        const newKey = input.name;
        await tx.$executeRaw`
            UPDATE "TableRow"
            SET "data" = jsonb_set("data", ${`{${newKey}}`}::text[], 'null'::jsonb, true)
            WHERE "tableId" = ${input.tableId};
        `;

        return newColumn;
      });
    }),
  addRow: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // grab col keys
        const cols = await tx.tableColumn.findMany({
          where: { tableId: input.tableId },
          select: { key: true },
        });

        // build row
        const data = Object.fromEntries(
          cols.map((c) => [c.key, null]),
        ) as Record<string, JsonValue>;

        // get next pos
        const { nextRowPos } = await tx.table.update({
          where: { id: input.tableId },
          data: { nextRowPos: { increment: 1 } },
          select: { nextRowPos: true },
        });
        const position = nextRowPos - 1;

        // insert row
        return tx.tableRow.create({
          data: {
            tableId: input.tableId,
            data,
            position,
          },
        });
      });
    }),
  deleteColumn: protectedProcedure
    .input(z.object({ tableId: z.string(), columnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // find col key
        const col = await tx.tableColumn.findFirst({
          where: { id: input.columnId, tableId: input.tableId },
          select: { id: true, key: true },
        });
        if (!col) throw new Error("Column not found");

        // remove key from json
        await tx.$executeRawUnsafe(
          `
          UPDATE "TableRow"
          SET "data" = "data" - $1
          WHERE "tableId" = $2
          `,
          col.key,
          input.tableId,
        );

        // remove col record
        await tx.tableColumn.delete({
          where: { id: input.columnId },
        });
      });
    }),
  deleteRow: protectedProcedure
    .input(z.object({ rowId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tableRow.delete({
        where: { id: input.rowId },
      });
    }),
});
