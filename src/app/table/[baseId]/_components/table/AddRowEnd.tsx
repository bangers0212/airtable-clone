"use client";

import Image from "next/image";
import * as React from "react";
import { api } from "~/trpc/react";

type Props = {
  projectId: string;
  tableId: string;
  colSpan: number;
};

export default function AddRowEnd({ projectId, tableId, colSpan }: Props) {
  const utils = api.useUtils();

  const addRow = api.table.addRow.useMutation({
    onMutate: async ({ tableId: tid }) => {
      await utils.project.getById.cancel({ id: projectId });

      const prev = utils.project.getById.getData({ id: projectId });

      const tempRow = {
        id: `temp-${crypto.randomUUID()}`,
        tableId: tid,
        data: {},
        position: Number.MAX_SAFE_INTEGER,
      };

      utils.project.getById.setData({ id: projectId }, (draft) => {
        if (!draft) return draft;
        const t = draft.tables.find((x) => x.id === tid);
        if (!t) return draft;
        t.rows = [...t.rows, tempRow as never];
        return { ...draft };
      });

      return { prev };
    },

    // 2) Rollback on error
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        utils.project.getById.setData({ id: projectId }, ctx.prev);
      }
      alert("Failed to add row.");
    },

    // 3) Finalize: refetch to swap temp row with real one
    onSettled: async () => {
      await utils.project.getById.invalidate({ id: projectId });
    },
  });

  return (
    <tr>
      <td
        colSpan={colSpan}
        className="h-8 cursor-pointer border-r border-b border-gray-200 pl-9 hover:bg-gray-50"
        title="Add a new row"
        onClick={() => addRow.mutate({ tableId })}
      >
        <Image
          src="/images/add.svg"
          width={14}
          height={14}
          alt=""
          unoptimized
          className="h-4 w-4"
        />
      </td>
    </tr>
  );
}
