import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({ name: z.string().optional(), color: z.string().optional() })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          userId: ctx.session.user.id,
          name: input?.name,
          color: input?.color,
        },
      });
    }),
  listMine: protectedProcedure.query(({ ctx }) =>
    ctx.db.project.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
  ),
});
