import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type JsonValue } from "@prisma/client/runtime/library";
import { ColumnType } from "@prisma/client";

export const tableRouter = createTRPCRouter({
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
});
