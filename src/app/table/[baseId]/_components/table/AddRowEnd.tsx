"use client";

import Image from "next/image";
import * as React from "react";
import { api } from "~/trpc/react";

type Props = {
  projectId: string; // needed to update project.getById cache
  tableId: string;
  colSpan: number; // columns.length + 1 (index column + data columns)
};

export default function AddRowEnd({ projectId, tableId, colSpan }: Props) {
  const utils = api.useUtils();

  const addRow = api.table.addRow.useMutation({
    // 1) Optimistic update: push a temp row into the cache right away
    onMutate: async ({ tableId: tid }) => {
      // Cancel any outgoing refetches on this query
      await utils.project.getById.cancel({ id: projectId });

      // Snapshot previous data
      const prev = utils.project.getById.getData({ id: projectId });

      // Build a lightweight temp row; data can be {} (EditableCell handles undefined)
      const tempRow = {
        id: `temp-${crypto.randomUUID()}`,
        tableId: tid,
        data: {}, // blanks show up as empty cells
        position: Number.MAX_SAFE_INTEGER, // appears at end visually
      };

      // Write optimistic cache
      utils.project.getById.setData({ id: projectId }, (draft) => {
        if (!draft) return draft;
        const t = draft.tables.find((x) => x.id === tid);
        if (!t) return draft;
        // t.rows = [...t.rows, tempRow as any];
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
        className="h-8 cursor-pointer border-r border-b border-gray-200 hover:bg-gray-50"
        title="Add a new row"
        onClick={() => addRow.mutate({ tableId })}
      >
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/images/add.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
          <span className="text-xs text-gray-600">
            {addRow.isPending ? "Adding…" : "Add row"}
          </span>
        </div>
      </td>
    </tr>
  );
}
