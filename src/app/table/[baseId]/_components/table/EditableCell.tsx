"use client";

import { ColumnType } from "@prisma/client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";

type EditableCellProps = {
  rowId: string;
  columnKey: string;
  value: string | number | undefined;
  type: ColumnType;
};

export default function EditableCell({
  rowId,
  columnKey,
  value,
  type,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate } = api.table.updateRowData.useMutation();

  useEffect(() => {
    setCellValue(value);
  }, [value]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (cellValue !== value) {
      mutate({
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
