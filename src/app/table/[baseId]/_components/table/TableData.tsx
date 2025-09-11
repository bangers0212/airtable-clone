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

type ColMeta = {
  colType: ColumnType;
};

export default function TableData({
  rows,
  cols,
  tableId,
  projectId,
}: {
  rows: TableRow[];
  cols: TableColumn[];
  tableId: string;
  projectId: string;
}) {
  //   const [rowSelection, setRowSelection] = useState({});
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
            />
          );
        },
        meta: { colType: col.type } satisfies ColMeta,
      })),
    [cols],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full overflow-auto bg-gray-100">
      <div className="flex min-w-fit pr-40 pb-20">
        <table className="border-r border-b border-gray-200 bg-white text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                <th className="sticky top-0 z-10 h-8 max-w-[87px] min-w-[87px] bg-white font-medium shadow-[inset_0_-1px_0_0_#d1d5db]">
                  <div className="flex h-full items-center justify-center">
                    <div className="h-5 w-5 rounded border-1 border-gray-200 shadow" />
                  </div>
                </th>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="sticky top-0 z-10 h-8 max-w-[180px] min-w-[180px] border-r border-gray-200 bg-white px-3 font-medium shadow-[inset_0_-1px_0_0_#d1d5db] hover:bg-gray-50"
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="group hover:bg-gray-50">
                <td className="text flex h-8 items-center justify-center border-b border-gray-200 text-gray-500">
                  <div className="flex h-full w-full items-center justify-center group-hover:justify-between">
                    <span className="group-hover:hidden">{r.index + 1}</span>
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
                {r.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="h-8 max-w-[180px] min-w-[180px] cursor-default border-r border-b border-gray-200"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            <AddRowEnd
              tableId={tableId}
              projectId={projectId}
              colSpan={table.getAllColumns().length + 1}
            />
          </tbody>
        </table>
        <AddColumnHeader tableId={tableId} />
      </div>
    </div>
  );
}
