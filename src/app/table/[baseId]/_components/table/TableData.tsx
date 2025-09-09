"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";

export type Row = {
  first_name: string;
  last_name: string;
  age: number;
  phone: number;
  very_long_text_file_AAAAAAAAAAAAAAAAA: string;
};

export type Col = { key: keyof Row; label: string };

type Props = {
  rows: Row[];
  cols: Col[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (updater: VisibilityState) => void;
  sorting: SortingState;
  onSortingChange: (updater: SortingState) => void;
};

export default function TableData({
  rows,
  cols,
  columnVisibility,
  onColumnVisibilityChange,
  sorting,
  onSortingChange,
}: Props) {
  const columns = React.useMemo<ColumnDef<Row>[]>(
    () =>
      cols.map((c) => ({
        id: c.key as string,
        accessorKey: c.key as string,
        header: c.label,
        cell: ({ getValue }) => {
          const v = getValue() as string | number | undefined;
          return <div className="truncate">{v ?? ""}</div>;
        },
      })),
    [cols],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { columnVisibility, sorting },
    onColumnVisibilityChange: (updater) => {
      onColumnVisibilityChange(updater as VisibilityState);
    },
    onSortingChange: (updater) => {
      onSortingChange(updater as SortingState);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-full overflow-auto rounded border border-gray-200 bg-gray-100">
      <div>
        <table className="text-sm">
          <thead className="sticky top-0 z-10 bg-white text-left">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="h-8 w-[180px] max-w-[180px] overflow-hidden border border-gray-200 px-3 font-medium text-ellipsis whitespace-nowrap"
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                {r.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="h-8 w-[180px] max-w-[180px] overflow-hidden border border-gray-200 px-3 text-ellipsis whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
