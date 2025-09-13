"use client";

type View = { id: string; name: string };

export default function ViewSidebar({
  views,
  //   activeViewId,
  //   onSelect,
  //   onAdd,
}: {
  views: View[];
  //   activeViewId: string;
  //   onSelect: (id: string) => void;
  //   onAdd: () => void;
}) {
  return (
    <aside className="row-span-2 border-r border-gray-200 bg-white">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
        Views
      </div>
      <ul className="px-2">
        {views.map((v) => (
          <li key={v.id}>
            {/* <button
              onClick={() => onSelect(v.id)}
              className={`w-full rounded px-3 py-1.5 text-left text-sm ${
                v.id === activeViewId
                  ? "bg-gray-100 font-medium"
                  : "hover:bg-gray-50"
              }`}
            >
              {v.name}
            </button> */}
          </li>
        ))}
      </ul>
      <div className="p-2">
        <button
          //   onClick={onAdd}
          className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
        >
          + New view
        </button>
      </div>
    </aside>
  );
}
