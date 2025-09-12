"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type TableColumn, type TableRow, ColumnType } from "@prisma/client";
import Image from "next/image";
import EditableCell from "./EditableCell";
import AddColumnHeader from "./AddColumnHeader";
import AddRowEnd from "./AddRowEnd";
import { type Virtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { type HeaderMenuState } from "./HeaderContextMenu";
import { type RecordMenuState } from "./RecordContextMenu";

type ColMeta = {
  colType: ColumnType;
  columnId: string;
  columnKey: string;
  columnName: string;
};

type TableProps = {
  cols: TableColumn[];
  rows: TableRow[];
  tableId: string;
  projectId: string;
  virtualRows: VirtualItem[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  setMenuCol: React.Dispatch<React.SetStateAction<HeaderMenuState>>;
  setMenuRow: React.Dispatch<React.SetStateAction<RecordMenuState>>;
  showSkeleton: boolean;
};

export default function Table({
  cols,
  rows,
  tableId,
  projectId,
  virtualRows,
  rowVirtualizer,
  setMenuCol,
  setMenuRow,
  showSkeleton,
}: TableProps) {
  const columns = React.useMemo<ColumnDef<TableRow, unknown>[]>(
    () =>
      cols.map((col) => ({
        id: col.key,
        header: () => (
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 shrink-0">
              <Image
                src={
                  col.type === ColumnType.NUMBER
                    ? "/images/number.svg"
                    : "/images/text.svg"
                }
                width={16}
                height={16}
                alt=""
              />
            </span>
            <span className="truncate">{col.name}</span>
          </div>
        ),
        accessorFn: (row) => {
          const data = row.data as Record<string, unknown> | null;
          return data?.[col.key];
        },
        cell: (info) => {
          const value = info.getValue();
          const meta = info.column.columnDef.meta as ColMeta | undefined;
          return (
            <EditableCell
              rowId={info.row.original.id}
              columnKey={col.key}
              value={value as string | number}
              type={meta?.colType ?? ColumnType.TEXT}
              tableId={tableId}
            />
          );
        },
        meta: {
          colType: col.type,
          columnId: col.id,
          columnKey: col.key,
          columnName: col.name,
        } satisfies ColMeta,
      })),
    [cols, tableId],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const headerGroup = table.getHeaderGroups()[0]!;

  return (
    <div className="flex min-w-fit pr-40 pb-20">
      <table className="bg-white text-sm">
        {/* col styling */}
        <colgroup>
          <col className="w-[87px]" />
          {cols.map((c) => (
            <col key={c.id} className="w-[180px]" />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-20 cursor-default bg-white">
          <tr key={headerGroup.id}>
            <th className="h-8 max-w-[87px] min-w-[87px] shadow-[inset_0_-1px_0_0_#d1d5db]">
              {/* checkbox marker */}
              <div className="flex h-full items-center justify-center">
                <div className="h-5 w-5 rounded border-1 border-gray-200 shadow" />
              </div>
            </th>
            {headerGroup.headers.map((h) => {
              const meta = h.column.columnDef.meta as ColMeta;
              return (
                <th
                  key={h.id}
                  className="h-8 max-w-[180px] min-w-[180px] border-r border-gray-200 px-3 font-medium shadow-[inset_0_-1px_0_0_#d1d5db] hover:bg-gray-50"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuCol({
                      open: true,
                      x: e.clientX,
                      y: e.clientY,
                      columnId: meta.columnId,
                      columnName: meta.columnName,
                      tableId,
                    });
                  }}
                >
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          style={{
            height: `${showSkeleton ? rowVirtualizer.getTotalSize() + 3200 : rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualRows.map((vRow) => {
            const row = table.getRowModel().rows[vRow.index]!;
            return (
              <tr
                key={vRow.key}
                className="group hover:bg-gray-50"
                data-index={vRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${vRow.start}px)`,
                }}
                ref={rowVirtualizer.measureElement}
              >
                <td className="text h-8 w-[87px] items-center border-b border-gray-200 text-gray-500">
                  <div className="flex h-full w-full items-center justify-center group-hover:justify-between">
                    <span className="group-hover:hidden">{row.index + 1}</span>
                    <Image
                      src="/images/DotsSixVertical.svg"
                      width={14}
                      height={14}
                      alt=""
                      unoptimized
                      className="hidden h-5 w-5 group-hover:block"
                    />
                    <div className="hidden h-5 w-5 rounded border-1 border-gray-200 bg-white shadow group-hover:block" />
                    <Image
                      src="/images/ArrowsOutSimple.svg"
                      width={14}
                      height={14}
                      alt=""
                      unoptimized
                      className="hidden h-5 w-5 rounded bg-white shadow group-hover:block"
                    />
                  </div>
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="h-8 max-w-[180px] min-w-[180px] cursor-default border-r border-b border-gray-200"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMenuRow({
                        open: true,
                        x: e.clientX,
                        y: e.clientY,
                        rowId: row.id,
                      });
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {showSkeleton &&
            Array.from({ length: 100 }).map((_, index) => (
              <tr
                key={`skeleton-${index}`}
                className="group"
                style={{
                  height: "32px",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${rowVirtualizer.getTotalSize() + index * 32}px)`,
                }}
              >
                <td className="h-8 w-[87px] border-b border-gray-200">
                  <div className="h-full w-full bg-white"></div>
                </td>
                {cols.map((col) => (
                  <td
                    key={`skeleton-${index}-${col.id}`}
                    className="h-8 w-[180px] border-r border-b border-gray-200"
                  >
                    <div className="flex h-full items-center p-2">
                      <div
                        className="h-3 animate-pulse rounded-full bg-gray-200"
                        style={{ width: 150 }} // Varying widths for visual interest
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
        <tfoot>
          <AddRowEnd
            tableId={tableId}
            projectId={projectId}
            colSpan={table.getAllColumns().length + 1}
          />
        </tfoot>
      </table>
      <AddColumnHeader tableId={tableId} />
    </div>
  );
}
