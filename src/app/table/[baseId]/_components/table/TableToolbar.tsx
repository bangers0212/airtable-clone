"use client";

import * as React from "react";
import type { Col } from "./TableData";
import type { SortingState, VisibilityState } from "@tanstack/react-table";

export default function TableToolbar({
  cols,
  columnVisibility,
  onColumnVisibilityChange,
  sorting,
  onSortingChange,
}: {
  cols: Col[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (v: VisibilityState) => void;
  sorting: SortingState;
  onSortingChange: (s: SortingState) => void;
}) {
  const [hideOpen, setHideOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);

  const currentSort = sorting[0];
  const [sortCol, setSortCol] = React.useState<string>(currentSort?.id ?? "");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">(
    currentSort?.desc ? "desc" : "asc",
  );

  React.useEffect(() => {
    if (!currentSort) return;
    setSortCol(currentSort.id);
    setSortDir(currentSort.desc ? "desc" : "asc");
  }, [currentSort]);

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
      {/* Hide fields */}
      <div className="relative">
        <button
          onClick={() => setHideOpen((v) => !v)}
          className="rounded border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50"
        >
          Hide fields
        </button>
        {hideOpen && (
          <div
            className="absolute left-0 z-20 mt-2 w-56 rounded border border-gray-200 bg-white p-2 shadow"
            onMouseLeave={() => setHideOpen(false)}
          >
            <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
              Columns
            </div>
            <ul className="max-h-64 overflow-auto">
              {cols.map((c) => {
                const hidden = columnVisibility[c.key as string] === false;
                return (
                  <li
                    key={c.key as string}
                    className="flex items-center gap-2 px-1 py-1"
                  >
                    <input
                      id={`col-${String(c.key)}`}
                      type="checkbox"
                      className="h-4 w-4"
                      checked={!hidden}
                      onChange={(e) => {
                        const next: VisibilityState = {
                          ...columnVisibility,
                          [c.key as string]: e.target.checked ? true : false,
                        };
                        onColumnVisibilityChange(next);
                      }}
                    />
                    <label htmlFor={`col-${String(c.key)}`} className="text-sm">
                      {c.label}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <button
          onClick={() => setSortOpen((v) => !v)}
          className="rounded border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50"
        >
          Sort
        </button>
        {sortOpen && (
          <div
            className="absolute left-0 z-20 mt-2 w-64 rounded border border-gray-200 bg-white p-3 shadow"
            onMouseLeave={() => setSortOpen(false)}
          >
            <div className="mb-2 text-xs font-semibold text-gray-500 uppercase">
              Sort by column
            </div>
            <div className="flex items-center gap-2">
              <select
                className="w-40 rounded border border-gray-300 px-2 py-1 text-sm"
                value={sortCol}
                onChange={(e) => setSortCol(e.target.value)}
              >
                <option value="">(none)</option>
                {cols.map((c) => (
                  <option key={String(c.key)} value={String(c.key)}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select
                className="rounded border border-gray-300 px-2 py-1 text-sm"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
              >
                <option value="asc">A → Z / 0 → 9</option>
                <option value="desc">Z → A / 9 → 0</option>
              </select>
              <button
                className="rounded bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700"
                onClick={() => {
                  if (!sortCol) onSortingChange([]);
                  else
                    onSortingChange([
                      { id: sortCol, desc: sortDir === "desc" },
                    ]);
                  setSortOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
