"use client";

import * as React from "react";
import { type TableColumn, type TableRow } from "@prisma/client";
import { api } from "~/trpc/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import Table from "./Table";
import HeaderContextMenu, { type HeaderMenuState } from "./HeaderContextMenu";
import RecordContextMenu from "./RecordContextMenu";
import { type RecordMenuState } from "./RecordContextMenu";
import type { JsonValue } from "@prisma/client/runtime/library";

export default function TableContainer({
  tableId,
  projectId,
  cols,
}: {
  tableId: string;
  projectId: string;
  cols: TableColumn[];
}) {
  const utils = api.useUtils();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.table.getRowsForTable.useInfiniteQuery(
      { tableId },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const flatRows = useMemo(
    () => data?.pages.flatMap((page) => page.rows) ?? [],
    [data],
  );

  // delete col handler
  const [menuCol, setMenuCol] = useState<HeaderMenuState>({
    open: false,
    x: 0,
    y: 0,
  });

  const handleDeleteCol = () => {
    if (menuCol.columnId) {
      deleteColumn.mutate({ tableId, columnId: menuCol.columnId });
      setMenuCol({ ...menuCol, open: false });
    }
  };

  const deleteColumn = api.table.deleteColumn.useMutation({
    onMutate: async ({ columnId, tableId }) => {
      await utils.table.getTableInfo.cancel({ tableId });
      await utils.table.getRowsForTable.cancel({ tableId });

      const previousTableInfo = utils.table.getTableInfo.getData({ tableId });
      const previousRowsData = utils.table.getRowsForTable.getInfiniteData({
        tableId,
      });

      utils.table.getTableInfo.setData({ tableId }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          columns: oldData.columns.filter((col) => col.id !== columnId),
        };
      });

      utils.table.getRowsForTable.setInfiniteData({ tableId }, (oldData) => {
        if (!oldData) return oldData;

        const columnKeyToRemove = previousTableInfo?.columns.find(
          (c) => c.id === columnId,
        )?.key;

        if (!columnKeyToRemove) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            rows: page.rows.map((row) => {
              const newRowData = { ...(row.data as Record<string, JsonValue>) };
              delete newRowData[columnKeyToRemove];
              return {
                ...row,
                data: newRowData,
              };
            }),
          })),
        };
      });

      return { previousTableInfo, previousRowsData };
    },

    onError: (err, { tableId }, context) => {
      // rollback
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
    },
    onSettled: async () => {
      await utils.table.getTableInfo.invalidate({ tableId });
      await utils.table.getRowsForTable.invalidate({ tableId });
    },
  });

  // delete row handler
  const deleteRow = api.table.deleteRow.useMutation({
    onMutate: async ({ rowId }) => {
      await utils.table.getRowsForTable.cancel({ tableId });

      const previousRowsData = utils.table.getRowsForTable.getInfiniteData({
        tableId,
      });

      utils.table.getRowsForTable.setInfiniteData({ tableId }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            rows: page.rows.filter((row) => row.id !== rowId),
          })),
        };
      });

      return { previousRowsData };
    },
    onError: (err, { rowId }, context) => {
      // rollback
      if (context?.previousRowsData) {
        utils.table.getRowsForTable.setInfiniteData(
          { tableId },
          context.previousRowsData,
        );
      }
    },
    onSettled: async () => {
      await utils.table.getRowsForTable.invalidate({ tableId });
    },
  });

  const estimateSize = React.useCallback(() => 32, []);

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize,
    overscan: 50,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const lastIndex = virtualRows.length
    ? virtualRows[virtualRows.length - 1]!.index
    : -1;

  const requestedRef = React.useRef<unknown>(null);
  const next = data?.pages?.[data.pages.length - 1]?.nextCursor ?? null;

  const NEAR_END = 150;
  const atEnd = lastIndex >= flatRows.length - 1 - NEAR_END;

  React.useEffect(() => {
    if (lastIndex < 0) return;
    if (!hasNextPage || isFetchingNextPage) return;
    if (atEnd && next !== null && requestedRef.current !== next) {
      requestedRef.current = next;
      void fetchNextPage();
    }
  }, [lastIndex, atEnd, hasNextPage, isFetchingNextPage, fetchNextPage, next]);

  const [menuRow, setMenuRow] = useState<RecordMenuState>({
    open: false,
    x: 0,
    y: 0,
  });

  const handleDeleteRow = () => {
    if (menuRow.rowId) {
      deleteRow.mutate({ rowId: menuRow.rowId });
      setMenuRow({ ...menuRow, open: false });
    }
  };

  const seedRows = api.table.seedRows.useMutation({
    onMutate: async () => {
      await utils.table.getRowsForTable.cancel({ tableId });
    },
    onSettled: async () => {
      await utils.table.getRowsForTable.invalidate({ tableId });
      await utils.table.getTableInfo.invalidate({ tableId });
    },
  });

  const onAdd100k = React.useCallback(() => {
    if (!seedRows.isPending) {
      seedRows.mutate({ tableId, count: 100_000 });
    }
  }, [seedRows, tableId]);

  return (
    <div className="h-full overflow-auto bg-gray-100" ref={tableContainerRef}>
      <Table
        tableId={tableId}
        projectId={projectId}
        rows={flatRows}
        cols={cols}
        virtualRows={virtualRows}
        setMenuCol={setMenuCol}
        setMenuRow={setMenuRow}
        rowVirtualizer={rowVirtualizer}
        showSkeleton={
          isLoading || isFetchingNextPage || (seedRows.isPending && atEnd)
        }
      />
      <HeaderContextMenu
        state={menuCol}
        onDelete={handleDeleteCol}
        onClose={() => setMenuCol({ ...menuCol, open: false })}
      />
      <RecordContextMenu
        state={menuRow}
        onDelete={handleDeleteRow}
        onClose={() => setMenuRow({ ...menuRow, open: false })}
      />
      <button
        type="button"
        onClick={onAdd100k}
        disabled={seedRows.isPending}
        aria-busy={seedRows.isPending}
        aria-label="add 100k rows"
        className="fixed bottom-4 left-90 z-50 rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {seedRows.isPending ? "Adding Rows..." : "Add 100k Rows"}
      </button>
    </div>
  );
}
