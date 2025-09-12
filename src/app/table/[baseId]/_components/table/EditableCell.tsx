"use client";

import { ColumnType } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import type { TableRow } from "@prisma/client";

type EditableCellProps = {
  rowId: string;
  columnKey: string;
  value: string | number | undefined;
  type: ColumnType;
  tableId: string;
};

export default function EditableCell({
  rowId,
  columnKey,
  value,
  type,
  tableId,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  const updateRowDataMutation = api.table.updateRowData.useMutation({
    onMutate: async (newRowData) => {
      await utils.table.getRowsForTable.cancel({ tableId });

      // from cache
      const previousRows = utils.table.getRowsForTable.getData({
        tableId,
      });

      // optimistic update
      utils.table.getRowsForTable.setInfiniteData({ tableId }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            rows: page.rows.map((row: TableRow) => {
              if (row.id === newRowData.rowId) {
                const updatedData = {
                  ...(row.data as Record<string, JsonValue>),
                  [newRowData.key]: newRowData.value,
                };
                return { ...row, data: updatedData };
              }
              return row;
            }),
          })),
        };
      });

      return { previousRows };
    },
    onError: (err, newRowData, context) => {
      // rollback
      utils.table.getRowsForTable.setData({ tableId }, context?.previousRows);

      console.error("Mutation failed:", err);
    },
    onSettled: () => {
      // cache invalidate
      void utils.table.getRowsForTable.invalidate({ tableId });
    },
  });

  useEffect(() => {
    setCellValue(value);
  }, [value]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (cellValue !== value) {
      updateRowDataMutation.mutate({
        rowId,
        key: columnKey,
        value:
          type === ColumnType.NUMBER ? Number(cellValue) : String(cellValue),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setCellValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const displayValue =
    type === ColumnType.NUMBER
      ? Number.isFinite(Number(cellValue))
        ? cellValue
        : ""
      : cellValue;

  return (
    <div
      className="flex h-full w-full items-center text-left"
      onDoubleClick={handleDoubleClick}
      suppressContentEditableWarning
      tabIndex={0}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type={type === ColumnType.NUMBER ? "number" : "text"}
          value={cellValue ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-full w-full bg-white p-0 px-3 text-left text-sm"
        />
      ) : (
        <span className="truncate px-3">{displayValue}</span>
      )}
    </div>
  );
}
