"use client";

import { ColumnType } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";
import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import type { TableRow } from "@prisma/client";
import React from "react";

type EditableCellProps = {
  rowId: string;
  columnKey: string;
  value: string | number | undefined;
  type: ColumnType;
  tableId: string;
  rowIndex: number;
  colKey: string;
};

function focusHorizontalSibling(
  from: HTMLElement,
  direction: "left" | "right",
) {
  // start from the td that wraps the current div
  const td = from.closest("td");
  if (!td) return;

  let sib: Element | null = td;
  while (sib) {
    sib =
      direction === "right"
        ? sib.nextElementSibling
        : sib.previousElementSibling;

    // skip cells that don't host our focusable inner div
    const target = sib?.querySelector<HTMLElement>("[data-col-key]");
    if (target) {
      target.focus();
      return;
    }
  }
}

export default function EditableCell({
  rowId,
  columnKey,
  value,
  type,
  tableId,
  rowIndex,
  colKey,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [cellValue, setCellValue] = useState(value);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setCellValue(value);
  }, [value]);

  const handleBlur = () => {
    if (cellValue !== value) {
      updateRowDataMutation.mutate({
        rowId,
        key: columnKey,
        value:
          type === ColumnType.NUMBER ? Number(cellValue) : String(cellValue),
      });
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCellValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape" || e.key === "ArrowDown") {
      inputRef.current?.blur();
    } else {
      inputRef.current?.focus();
    }
  };

  const isPrintable = (e: React.KeyboardEvent) =>
    e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

  const handleWrapperKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextRow = document.querySelector(
          `[data-index="${rowIndex + 1}"]`,
        );
        const nextCell = nextRow?.querySelector(
          `[data-col-key="${colKey}"]`,
        ) as HTMLElement | null;
        nextCell?.focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevRow = document.querySelector(
          `[data-index="${rowIndex - 1}"]`,
        );
        const prevCell = prevRow?.querySelector(
          `[data-col-key="${colKey}"]`,
        ) as HTMLElement | null;
        prevCell?.focus();
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        focusHorizontalSibling(e.currentTarget, "right");
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        focusHorizontalSibling(e.currentTarget, "left");
        break;
      }
      case "Escape":
        (e.currentTarget as HTMLElement).blur();
        break;
    }

    if (!isPrintable(e)) return;

    setIsEditing(true);
  };

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

  const displayValue =
    type === ColumnType.NUMBER
      ? Number.isFinite(Number(cellValue))
        ? cellValue
        : ""
      : cellValue;

  return (
    <div
      className="flex h-full w-full items-center text-left focus:bg-white focus:outline-2 focus:outline-blue-500"
      onDoubleClick={() => setIsEditing(true)}
      onKeyDown={handleWrapperKeyDown}
      onClick={(e) => e.currentTarget.focus()}
      data-row-index={rowIndex}
      data-col-key={colKey}
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
        <span
          className={`truncate ${type === ColumnType.NUMBER ? "text-right" : "text-left"} w-full px-3`}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}
