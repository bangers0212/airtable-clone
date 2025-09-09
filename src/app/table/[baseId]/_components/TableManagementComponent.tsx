"use client";

import * as React from "react";
import { faker } from "@faker-js/faker";
import TableData, { type Row, type Col } from "./table/TableData";
import TableTabs from "./table/TableTabs";
import ViewSidebar from "./table/TableViews";
import TableToolbar from "./table/TableToolbar";
import type { SortingState, VisibilityState } from "@tanstack/react-table";

function makeRows(n: number): Row[] {
  return Array.from({ length: n }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 70 }),
    phone: faker.number.int({ min: 1000000, max: 9999999 }),
    very_long_text_file_AAAAAAAAAAAAAAAAA: "long long long long owrd",
  }));
}

const BASE_COLS: Col[] = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "age", label: "Age" },
  { key: "phone", label: "Phone" },
  {
    key: "very_long_text_file_AAAAAAAAAAAAAAAAA",
    label: "very_long_text_file_AAAAAAAAAAAAAAAAA",
  },
];

type ViewState = {
  id: string;
  name: string;
  columnVisibility: VisibilityState;
  sorting: SortingState;
};

type TableState = {
  id: string;
  name: string;
  cols: Col[];
  rows: Row[];
  views: ViewState[];
  activeViewId: string;
};

export default function TableManagementComponent() {
  // Seed two demo tables
  const [tables, setTables] = React.useState<TableState[]>(() => {
    const t1View: ViewState = {
      id: faker.string.nanoid(8),
      name: "Grid view",
      columnVisibility: {}, // all visible
      sorting: [],
    };
    const t2View: ViewState = {
      id: faker.string.nanoid(8),
      name: "Grid view",
      columnVisibility: {},
      sorting: [],
    };
    return [
      {
        id: faker.string.nanoid(8),
        name: "Contacts",
        cols: BASE_COLS,
        rows: makeRows(50),
        views: [t1View],
        activeViewId: t1View.id,
      },
      {
        id: faker.string.nanoid(8),
        name: "Leads",
        cols: BASE_COLS,
        rows: makeRows(200),
        views: [t2View],
        activeViewId: t2View.id,
      },
    ];
  });

  const [activeTableId, setActiveTableId] = React.useState<string>(
    tables[0]!.id,
  );

  const activeTable = tables.find((t) => t.id === activeTableId)!;
  const activeView = activeTable.views.find(
    (v) => v.id === activeTable.activeViewId,
  )!;

  // Handlers
  const addTable = () => {
    const v: ViewState = {
      id: faker.string.nanoid(8),
      name: "Grid view",
      columnVisibility: {},
      sorting: [],
    };
    const t: TableState = {
      id: faker.string.nanoid(8),
      name: `Table ${tables.length + 1}`,
      cols: BASE_COLS,
      rows: makeRows(30),
      views: [v],
      activeViewId: v.id,
    };
    setTables((prev) => [...prev, t]);
    setActiveTableId(t.id);
  };

  const addView = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.id !== activeTableId
          ? t
          : {
              ...t,
              views: [
                ...t.views,
                {
                  id: faker.string.nanoid(8),
                  name: `View ${t.views.length + 1}`,
                  columnVisibility: {},
                  sorting: [],
                },
              ],
              activeViewId: t.views[t.views.length - 1]
                ? t.views[t.views.length - 1]!.id // (just for selection UX)
                : t.activeViewId,
            },
      ),
    );
  };

  const selectView = (viewId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId ? { ...t, activeViewId: viewId } : t,
      ),
    );
  };

  const updateViewColumnVisibility = (vis: VisibilityState) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id !== activeTableId
          ? t
          : {
              ...t,
              views: t.views.map((v) =>
                v.id === t.activeViewId ? { ...v, columnVisibility: vis } : v,
              ),
            },
      ),
    );
  };

  const updateViewSorting = (sorting: SortingState) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id !== activeTableId
          ? t
          : {
              ...t,
              views: t.views.map((v) =>
                v.id === t.activeViewId ? { ...v, sorting } : v,
              ),
            },
      ),
    );
  };

  return (
    <div className="grid h-full grid-cols-[280px_1fr] grid-rows-[32px_47px_1fr]">
      <div className="col-span-2">
        <TableTabs
          tabs={tables.map((t) => ({ id: t.id, name: t.name }))}
          activeId={activeTableId}
          onSelect={setActiveTableId}
          onAdd={addTable}
        />
      </div>

      <div className="col-span-2 border-b border-gray-200 bg-white">
        <TableToolbar
          cols={activeTable.cols}
          columnVisibility={activeView.columnVisibility}
          onColumnVisibilityChange={updateViewColumnVisibility}
          sorting={activeView.sorting}
          onSortingChange={updateViewSorting}
        />
      </div>

      <ViewSidebar
        views={activeTable.views.map((v) => ({ id: v.id, name: v.name }))}
        activeViewId={activeTable.activeViewId}
        onSelect={selectView}
        onAdd={addView}
      />

      <div className="overflow-hidden bg-gray-50">
        <div className="h-full">
          <TableData
            rows={activeTable.rows}
            cols={activeTable.cols}
            columnVisibility={activeView.columnVisibility}
            onColumnVisibilityChange={updateViewColumnVisibility}
            sorting={activeView.sorting}
            onSortingChange={updateViewSorting}
          />
        </div>
      </div>
    </div>
  );
}
