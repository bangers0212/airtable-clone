"use client";

import * as React from "react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { ColumnType } from "@prisma/client";
import Image from "next/image";

export default function AddColumnHeader({ tableId }: { tableId: string }) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<ColumnType>(
    ColumnType.TEXT,
  );

  const addColumnMutation = api.table.addColumn.useMutation({
    onSuccess: () => {
      setIsAddingColumn(false);
      setNewColumnName("");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleAddColumn = () => {
    if (newColumnName.trim() === "") {
      return alert("Column name cannot be empty.");
    }
    addColumnMutation.mutate({
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
