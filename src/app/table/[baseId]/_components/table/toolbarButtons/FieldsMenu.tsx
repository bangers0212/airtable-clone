import { type TableColumn } from "@prisma/client";
import React from "react";

type FieldsColInfo = {
  colKey: string;
  showing: boolean;
};

export type FieldsMenuState = {
  open: boolean;
  x: number;
  y: number;
};

type FieldsMenuProps = {
  state: FieldsMenuState;
  onClose: () => void;
  cols: TableColumn[];
};

export default function FieldsMenu({ state, onClose, cols }: FieldsMenuProps) {
  const [colStates, setColStates] = React.useState<FieldsColInfo[]>(
    cols.map((col) => ({ colKey: col.key, showing: true })),
  );

  const handleToggle = (colKey: string) => {
    setColStates(
      colStates.map((col) =>
        col.colKey === colKey ? { ...col, showing: !col.showing } : col,
      ),
    );
  };

  React.useEffect(() => {
    if (!state.open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (_: MouseEvent) => onClose();
    const onScroll = () => onClose();
    window.addEventListener("keydown", onEsc);
    window.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [state.open, onClose]);

  if (!state.open) return null;

  return (
    <div
      style={{ top: state.y, left: state.x }}
      className="fixed z-50 w-[320px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
      role="menu"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2">
        {colStates.map((colState) => {
          const column = cols.find((c) => c.key === colState.colKey);
          if (!column) return null;

          return (
            <div
              key={colState.colKey}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={colState.showing}
                onChange={() => handleToggle(colState.colKey)}
              />
              <span>{column.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
