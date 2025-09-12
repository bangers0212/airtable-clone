"use client";

type Tab = { id: string; name: string };

export default function TableTabs({
  tabs,
  activeId,
  onSelect,
  onAdd,
}: {
  tabs: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex h-8 items-stretch border-b border-gray-200 bg-gray-100">
      <ul role="tablist" aria-label="Tables" className="flex items-stretch">
        {tabs.map((t, i) => {
          const isActive = t.id === activeId;
          return (
            <li key={t.id} className="flex">
              <button
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelect(t.id)}
                className={[
                  "h-full px-3 text-sm leading-8 transition-colors",
                  // Thin, clean seams between neighbors
                  i > 0 ? "-ml-px" : "",
                  // Top/left/right borders + rounded top
                  "rounded-t-md border-t border-r border-l border-gray-300",
                  // Active tab overlaps the row’s bottom border
                  isActive
                    ? "z-10 -mb-px border-b border-b-white bg-white text-gray-900"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                {t.name}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="ml-2 flex items-center">
        <button
          onClick={onAdd}
          className="h-6 rounded px-2 text-sm leading-6 text-blue-700 hover:bg-blue-50"
        >
          + New table
        </button>
      </div>
    </div>
  );
}
