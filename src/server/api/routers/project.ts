import { z } from "zod";
import { faker } from "@faker-js/faker";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ColumnType, type Prisma } from "@prisma/client";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({ name: z.string().optional(), color: z.string().optional() })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // project
        const project = await tx.project.create({
          data: {
            userId: ctx.session.user.id,
            name: input?.name ?? "Untitled Base",
            color: input?.color ?? "#808080",
          },
        });

        // auto insert first table
        const table = await tx.table.create({
          data: {
            projectId: project.id,
            name: "Table 1",
          },
        });

        // default data
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

        await tx.tableColumn.createMany({
          data: seedColumns.map((c, i) => ({
            tableId: table.id,
            name: c.name,
            key: c.key,
            type: c.type,
            position: i,
          })),
        });

        const seedRowsCount = 20;
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
        await tx.tableRow.createMany({ data: rowsData });

        // update counters for table
        await tx.table.update({
          where: { id: table.id },
          data: {
            nextColPos: seedColumns.length,
            nextRowPos: seedRowsCount,
          },
        });
      });
    }),
  listMine: protectedProcedure.query(({ ctx }) =>
    ctx.db.project.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { lastAccessedAt: "desc" },
    }),
  ),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findUnique({
        where: { id: input.id },
        include: {
          tables: {
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    }),
});
