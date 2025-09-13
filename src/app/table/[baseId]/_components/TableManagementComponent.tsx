"use client";

import * as React from "react";
import TableTabs from "./table/TableTabs";
import ViewSidebar from "./table/ViewSidebar";
import TableToolbar from "./table/TableToolbar";
import { api } from "~/trpc/react";
import TableContainer from "./table/TableContainer";
import type { Filter, Condition } from "./table/toolbarButtons/Filter";
import type { TableView, Table, TableColumn } from "@prisma/client";

type ViewState = Pick<TableView, "id" | "name" | "searchQuery" | "position"> & {
  sorting: { colKey: string; desc: boolean }[];
  filters: { filters: Filter[]; operator: Condition };
  columnVisibility: Record<string, boolean>;
};

type ProjectWithTables = {
  id: string;
  name: string;
  tables: Pick<Table, "id" | "name">[];
};

type TableWithViews = {
  id: string;
  name: string;
  columns: TableColumn[];
  views: TableView[];
};

export default function TableManagementComponent({
  projectId,
}: {
  projectId: string;
}) {
  const [activeTableId, setActiveTableId] = React.useState<string | null>(null);
  const [activeView, setActiveView] = React.useState<ViewState | null>(null);
  const utils = api.useUtils();

  const {
    data: project,
    isLoading: isProjectLoading,
    mutate: accessProject,
  } = api.project.accessProject.useMutation();

  const {
    data: project,
    isLoading: isProjectLoading,
    mutate: accessProject,
  } = api.project.accessProject.useMutation();

  const { data: tableInfo, isLoading: isTableInfoLoading } =
    api.table.getTableInfo.useQuery(
      { tableId: activeTableId! },
      { enabled: !!activeTableId },
    );

  // creating a table
  const createTableMutation = api.table.createTable.useMutation({
    onSuccess: async (newTable) => {
      await utils.project.accessProject.invalidate({ id: projectId });
      setActiveTableId(newTable.id);
    },
  });

  const addTable = () => {
    createTableMutation.mutate({ projectId });
  };

  //   const createViewMutation = api.table.createView.useMutation({
  //     onSuccess: async (newView) => {
  //       await utils.table.getTableInfo.invalidate({ tableId: activeTableId! });
  //       setActiveView(newView as ViewState);
  //     },
  //   });

  React.useEffect(() => {
    accessProject({ id: projectId });
  }, [projectId, accessProject]);

  React.useEffect(() => {
    if (activeTableId || !project?.tables.length) return;
    setActiveTableId(project.tables[0]!.id);
  }, [activeTableId, project]);

  React.useEffect(() => {
    if (!tableInfo?.views.length) return;
    setActiveView(tableInfo.views[0] as unknown as ViewState);
  }, [tableInfo]);

  // loading states
  if (isProjectLoading || isTableInfoLoading) {
    return <div>Loading…</div>;
  }
  if (!project || !tableInfo) {
    return <div>Project or table not found</div>;
  }

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

      <ViewSidebar
        views={tableInfo.views.map((v) => ({ id: v.id, name: v.name }))}
        // activeViewId={activeTable.activeViewId}
        // onSelect={selectView}
        // onAdd={addView}
      />

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
