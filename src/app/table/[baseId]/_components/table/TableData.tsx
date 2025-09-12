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
import HeaderContextMenu, { type HeaderMenuState } from "./HeaderContextMenu";
import { api } from "~/trpc/react";
import { useVirtualizer } from "@tanstack/react-virtual";

type ColMeta = {
  colType: ColumnType;
  columnId: string;
  columnKey: string;
  columnName: string;
};

export default function TableData({
  cols,
  tableId,
  projectId,
}: {
  cols: TableColumn[];
  tableId: string;
  projectId: string;
}) {
  const utils = api.useUtils();
  const deleteColumn = api.table.deleteColumn.useMutation({
    onSuccess: async () => {
      await utils.project.getById.invalidate({ id: projectId });
    },
    onError: (e) => {
      console.error(e.message);
    },
  });

  const [menu, setMenu] = React.useState<HeaderMenuState>({
    open: false,
    x: 0,
    y: 0,
  });

  const columns = React.useMemo<ColumnDef<TableRow, unknown>[]>(
    () =>
      cols.map((col) => ({
        id: col.key,
        header: () => (
          <></>
          //   <div className="flex items-center gap-2">
          //     <span className="h-4 w-4 shrink-0">
          //       <Image
          //         src={
          //           col.type === ColumnType.NUMBER
          //             ? "/images/number.svg"
          //             : "/images/text.svg"
          //         }
          //         width={16}
          //         height={16}
          //         alt=""
          //       />
          //     </span>
          //     <span className="truncate">{col.name}</span>
          //   </div>
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.table.getRowsForTable.useInfiniteQuery(
      { tableId },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const flatRows = React.useMemo(
    () => data?.pages.flatMap((page) => page.rows) ?? [],
    [data],
  );

  const table = useReactTable({
    data: flatRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  console.log(flatRows);

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 32,
  });

  React.useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;
    console.log("FIRED");

    if (
      lastItem.index >= flatRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    rowVirtualizer,
    fetchNextPage,
    flatRows.length,
    hasNextPage,
    isFetchingNextPage,
  ]);

  const virtualRows = rowVirtualizer.getVirtualItems();

  const headerGroup = table.getHeaderGroups()[0]!;

  return (
    <div className="h-full overflow-auto bg-gray-100" ref={tableContainerRef}>
      <div className="flex min-w-fit pr-40 pb-20">
        <table className="bg-white text-sm">
          {/* headers */}
          <thead className="sticky top-0 z-20 cursor-default bg-white">
            <tr key={headerGroup.id}>
              <th className="h-8 max-w-[87px] min-w-[87px] shadow-[inset_0_-1px_0_0_#d1d5db]">
                <div className="flex h-full items-center justify-center">
                  {/* checkbox stud */}
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
                      // context menu
                      setMenu({
                        open: true,
                        x: e.clientX,
                        y: e.clientY,
                        columnId: meta.columnId,
                        columnName: meta.columnName,
                        tableId,
                      });
                    }}
                    title={`${meta.columnName} — right click for options`}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                );
              })}
            </tr>
          </thead>
          {/* <div className="h-10 w-10 border-r border-b bg-amber-500 shadow-[inset_0_-1px_0_0_#d1d5db] hover:bg-gray-50"></div>
          <div className="h-10 w-10 border-r border-b bg-amber-500 shadow-[inset_0_-1px_0_0_#d1d5db] hover:bg-gray-50"></div> */}
          <tbody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {virtualRows.map((vRow) => {
              const row = table.getRowModel().rows[vRow.index]!;

              return (
                <tr
                  key={row.id}
                  className="group z-0 hover:bg-gray-50"
                  data-index={vRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  <td className="text flex h-8 items-center justify-center border-b border-gray-200 text-gray-500">
                    <div className="flex h-full w-full items-center justify-center group-hover:justify-between">
                      <span className="group-hover:hidden">
                        {row.index + 1}
                      </span>
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
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            <AddRowEnd
              tableId={tableId}
              projectId={projectId}
              colSpan={table.getAllColumns().length + 1}
            />
          </tbody>
        </table>
        <AddColumnHeader tableId={tableId} />
      </div>

      <HeaderContextMenu
        state={menu}
        onClose={() => setMenu((s) => ({ ...s, open: false }))}
        onDelete={() => {
          if (!menu.columnId) return;
          deleteColumn.mutate({
            tableId,
            columnId: menu.columnId,
          });
        }}
      />
    </div>
  );
}
