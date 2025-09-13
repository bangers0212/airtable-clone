"use client";

import * as React from "react";
import type { TableColumn } from "@prisma/client";
import Image from "next/image";
import FieldsMenu, { type FieldsMenuState } from "./toolbarButtons/FieldsMenu";

export default function TableToolbar({ cols }: { cols: TableColumn[] }) {
  const [fieldsMenuState, setFieldsMenuState] = React.useState<FieldsMenuState>(
    {
      open: false,
      x: 0,
      y: 0,
    },
  );

  const toggleFieldsMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setFieldsMenuState((prev) => ({
      open: !prev.open,
      x: rect.left - 25,
      y: rect.bottom + 5,
    }));
  };

  const closeFilterMenu = () => {
    setFieldsMenuState({ ...fieldsMenuState, open: false });
  };

  return (
    <div className="flex h-full w-full items-center justify-between gap-2 bg-white px-3 py-2">
      <div className="flex items-center gap-4">
        <div className="cursor-pointer rounded p-2 hover:bg-gray-100">
          <Image
            src="/images/list.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
        </div>
        <div className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100">
          <Image
            src="/images/GridFeature.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
          <span className="text-sm">Grid View</span>
          <Image
            src="/images/ChevronDown(1).svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          onClick={toggleFieldsMenu}
          className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100"
        >
          <Image
            src="/images/EyeSlash.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-500">Hide fields</span>
        </div>
        <div className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100">
          <Image
            src="/images/FunnelSimple.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-500">Filter</span>
        </div>
        <div className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100">
          <Image
            src="/images/Group.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-500">Group</span>
        </div>
        <div className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100">
          <Image
            src="/images/ArrowsDownUp.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-500">Sort</span>
        </div>
        <div className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100">
          <Image
            src="/images/PaintBucket.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-500">Color</span>
        </div>
        <div className="cursor-pointer rounded p-2 hover:bg-gray-100">
          <Image
            src="/images/RowHeightSmall.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
        </div>
        <div className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100">
          <Image
            src="/images/ArrowSquareOut.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-500">Share and sync</span>
        </div>
        <div className="cursor-pointer rounded p-2 hover:bg-gray-100">
          <Image
            src="/images/search.svg"
            width={14}
            height={14}
            alt=""
            unoptimized
            className="mx-2 h-4 w-4"
          />
        </div>
      </div>
      {fieldsMenuState.open && (
        <FieldsMenu
          state={fieldsMenuState}
          onClose={closeFilterMenu}
          cols={cols}
        />
      )}
    </div>
  );
}
