"use client";

import * as React from "react";
import TableData from "./table/TableData";
import TableTabs from "./table/TableTabs";
// import ViewSidebar from "./table/TableViews";
import TableToolbar from "./table/TableToolbar";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { api } from "~/trpc/react";
import type { TableColumn, TableRow } from "@prisma/client";
import TableContainer from "./table/TableContainer";

export default function TableManagementComponent({
  projectId,
}: {
  projectId: string;
}) {
  // load project
  const { data: project, isLoading: isProjectLoading } =
    api.project.getById.useQuery({
      id: projectId,
    });

  const [activeTableId, setActiveTableId] = React.useState<string | null>(null);

  // active tables data
  const { data: tableInfo, isLoading: isTableInfoLoading } =
    api.table.getTableInfo.useQuery(
      { tableId: activeTableId! },
      { enabled: !!activeTableId },
    );
  //   const { data: rows, isLoading: isRowsLoading } =
  //     api.table.getRowsForTable.useQuery(
  //       { tableId: activeTableId!, limit: 75, offset: 0 },
  //       { enabled: !!activeTableId },
  // );

  const utils = api.useUtils();

  // creating a table
  const createTableMutation = api.table.createTable.useMutation({
    onSuccess: async (newTable) => {
      await utils.project.getById.invalidate({ id: projectId });
      setActiveTableId(newTable.id);
    },
  });

  const addTable = () => {
    createTableMutation.mutate({ projectId });
  };

  // set first table as active
  React.useEffect(() => {
    if (activeTableId) return;

    const tables = project?.tables ?? [];
    if (tables.length === 0) return;

    setActiveTableId(tables[0]!.id);
  }, [project, activeTableId]);

  // loading states
  if (isProjectLoading || isTableInfoLoading) {
    return <div>Loading…</div>;
  }
  if (!project || !tableInfo) {
    return <div>Project or table not found</div>;
  }

  console.log(tableInfo);

  return (
    <div className="grid h-full grid-cols-[280px_1fr] grid-rows-[32px_47px_1fr]">
      <div className="col-span-2">
        <TableTabs
          tabs={project.tables.map((t) => ({ id: t.id, name: t.name }))}
          activeId={activeTableId!}
          onSelect={setActiveTableId}
          onAdd={addTable}
        />
      </div>

      <div className="col-span-2 border-b border-gray-200 bg-white">
        <TableToolbar
          cols={tableInfo.columns}
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
        <TableContainer
          tableId={tableInfo.id}
          projectId={projectId}
          cols={tableInfo.columns}
        />
      </div>
    </div>
  );
}
