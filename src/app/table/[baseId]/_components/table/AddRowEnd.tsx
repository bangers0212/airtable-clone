"use client";

import Image from "next/image";
import * as React from "react";
import { api } from "~/trpc/react";
import { type TableRow } from "@prisma/client";
import type { InfiniteData } from "@tanstack/react-query";

type Props = {
  projectId: string;
  tableId: string;
  colSpan: number;
};

export default function AddRowEnd({ projectId, tableId, colSpan }: Props) {
  const utils = api.useUtils();

  const addRow = api.table.addRow.useMutation({
    // optimistic row add
    onMutate: async ({ tableId }) => {
      await utils.table.getRowsForTable.cancel({ tableId });

      const previousRows = utils.table.getRowsForTable.getData({
        tableId,
      });

      const tempRow: TableRow = {
        id: `row-${crypto.randomUUID()}`,
        tableId,
        data: {},
        position: Number.MAX_SAFE_INTEGER,
      };

      utils.table.getRowsForTable.setInfiniteData({ tableId }, (oldData) => {
        if (!oldData || oldData.pages.length === 0) return oldData;

        // append to last page
        const lastPage = oldData.pages[oldData.pages.length - 1]!;
        const updatedLastPage = {
          ...lastPage,
          rows: [...lastPage.rows, tempRow],
          nextCursor: lastPage.nextCursor,
        };

        const newPages = [...oldData.pages.slice(0, -1), updatedLastPage];

        return { ...oldData, pages: newPages };
      });

      return { previousRows };
    },
    onError: (_err, _vars, ctx) => {
      // rollback
      if (ctx?.previousRows) {
        utils.table.getRowsForTable.setData({ tableId }, ctx.previousRows);
      }
    },
    onSettled: () => {
      void utils.table.getRowsForTable.invalidate({ tableId });
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
