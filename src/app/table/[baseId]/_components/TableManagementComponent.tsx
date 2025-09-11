"use client";

import * as React from "react";
import TableData from "./table/TableData";
// import TableTabs from "./table/TableTabs";
// import ViewSidebar from "./table/TableViews";
import TableToolbar from "./table/TableToolbar";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { api } from "~/trpc/react";
import type { TableColumn, TableRow } from "@prisma/client";

export default function TableManagementComponent({
  projectId,
}: {
  projectId: string;
}) {
  const { data: project, isLoading } = api.project.getById.useQuery({
    id: projectId,
  });

  if (isLoading) return <div>Loading…</div>;
  if (!project) return <div>Project not found</div>;

  const table = project.tables[0]!;
  console.log(table);

  return (
    <div className="grid h-full grid-cols-[280px_1fr] grid-rows-[32px_47px_1fr]">
      <div className="col-span-2">
        {/* <TableTabs
          tabs={tables.map((t) => ({ id: t.id, name: t.name }))}
          activeId={activeTableId}
          onSelect={setActiveTableId}
          onAdd={addTable}
        /> */}
      </div>

      <div className="col-span-2 border-b border-gray-200 bg-white">
        <TableToolbar
          cols={table.columns}
          //   columnVisibility={activeView.columnVisibility}
          //   onColumnVisibilityChange={updateViewColumnVisibility}
          //   sorting={activeView.sorting}
          //   onSortingChange={updateViewSorting}
        />
      </div>

      {/* <ViewSidebar
        views={activeTable.views.map((v) => ({ id: v.id, name: v.name }))}
        activeViewId={activeTable.activeViewId}
        onSelect={selectView}
        onAdd={addView}+
      /> */}

      <aside className="row-span-2 border-r border-gray-200 bg-white"></aside>

      <div className="h-full overflow-auto">
        <TableData
          rows={table.rows}
          cols={table.columns}
          tableId={table.id}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
