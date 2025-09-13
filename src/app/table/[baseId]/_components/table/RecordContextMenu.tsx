"use client";

import * as React from "react";

export type RecordMenuState = {
  open: boolean;
  x: number;
  y: number;
  rowId?: string;
};

export default function RecordContextMenu({
  state,
  onClose,
  onDelete,
}: {
  state: RecordMenuState;
  onClose: () => void;
  onDelete: () => void;
}) {
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
      className="fixed z-50 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
      role="menu"
    >
      <button
        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
      >
        Delete record
      </button>
    </div>
  );
}
