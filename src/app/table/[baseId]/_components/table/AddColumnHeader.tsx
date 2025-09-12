"use client";

import * as React from "react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { ColumnType } from "@prisma/client";
import Image from "next/image";
import type { JsonValue } from "@prisma/client/runtime/library";

export default function AddColumnHeader({ tableId }: { tableId: string }) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<ColumnType>(
    ColumnType.TEXT,
  );

  const utils = api.useUtils();

  const addColumn = api.table.addColumn.useMutation({
    onMutate: async ({ tableId, name, type }) => {
      await utils.table.getTableInfo.cancel({ tableId });
      await utils.table.getRowsForTable.cancel({ tableId });

      const previousTableInfo = utils.table.getTableInfo.getData({ tableId });
      const previousRowsData = utils.table.getRowsForTable.getInfiniteData({
        tableId,
      });

      const tempColumn = {
        id: `col-${crypto.randomUUID()}`,
        tableId,
        name: name,
        key: name,
        type: type,
        position: Number.MAX_SAFE_INTEGER,
      };

      utils.table.getTableInfo.setData({ tableId }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          columns: [...oldData.columns, tempColumn],
        };
      });

      utils.table.getRowsForTable.setInfiniteData({ tableId }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            rows: page.rows.map((row) => ({
              ...row,
              data: {
                ...(row.data as Record<string, JsonValue>),
                [name]: null,
              },
            })),
          })),
        };
      });

      return { previousTableInfo, previousRowsData };
    },
    onError: (err, { tableId }, context) => {
      // Rollback the cache.
      if (context?.previousTableInfo) {
        utils.table.getTableInfo.setData(
          { tableId },
          context.previousTableInfo,
        );
      }
      if (context?.previousRowsData) {
        utils.table.getRowsForTable.setInfiniteData(
          { tableId },
          context.previousRowsData,
        );
      }
      // Since alert is not allowed, you could handle this with a toast or custom UI message.
      console.error(err.message);
    },
    onSettled: async () => {
      setIsAddingColumn(false);
      setNewColumnName("");
      await utils.table.getTableInfo.invalidate({ tableId });
      await utils.table.getRowsForTable.invalidate({ tableId });
    },
  });

  const handleAddColumn = () => {
    if (newColumnName.trim() === "") {
      return alert("Column name cannot be empty.");
    }
    addColumn.mutate({
      tableId,
      name: newColumnName,
      type: newColumnType,
    });
  };

  if (isAddingColumn) {
    return (
      <div className="flex max-h-2 flex-col space-y-2 p-2">
        <input
          type="text"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          placeholder="Column name"
          className="rounded-md border p-1 text-sm"
        />
        <select
          value={newColumnType}
          onChange={(e) => setNewColumnType(e.target.value as ColumnType)}
          className="rounded-md border p-1 text-sm"
        >
          <option value={ColumnType.TEXT}>Text</option>
          <option value={ColumnType.NUMBER}>Number</option>
        </select>
        <div className="flex space-x-2">
          <button
            onClick={handleAddColumn}
            className="flex-1 rounded-md bg-blue-500 p-1 text-xs text-white"
          >
            Add
          </button>
          <button
            onClick={() => setIsAddingColumn(false)}
            className="flex-1 rounded-md bg-gray-300 p-1 text-xs text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAddingColumn(true)}
      className="sticky top-0 z-10 flex h-8 max-w-[87px] min-w-[87px] cursor-pointer items-center justify-center border-r border-gray-200 bg-white shadow-[inset_0_-1px_0_0_#d1d5db] hover:bg-gray-50"
    >
      <Image
        src="/images/add.svg"
        width={14}
        height={14}
        alt=""
        unoptimized
        className="h-4 w-4"
      />
    </button>
  );
}
