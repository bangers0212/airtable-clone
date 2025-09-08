"use client";

import Image from "next/image";
import CreateProjectButton from "./CreateProjectButton";

function SidebarBottomItem({
  icon,
  label,
  open,
}: {
  icon: React.ReactNode;
  label: string;
  open: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center justify-center rounded py-1 text-gray-600 hover:bg-gray-100 ${open && "cursor-pointer justify-start gap-2 px-3"} `}
    >
      <span className="h-4 w-4">{icon}</span>

      <span
        className={`truncate text-sm transition-[opacity,transform,width] ${
          open
            ? "w-auto translate-x-0 opacity-100"
            : "w-0 -translate-x-1 overflow-hidden opacity-0"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function SidebarMainItem({
  icon,
  label,
  open,
  selected = false,
}: {
  icon: React.ReactNode;
  label: string;
  open: boolean;
  selected?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center justify-center rounded py-2 text-gray-600 ${selected && open ? "bg-gray-100" : "hover:bg-gray-100"} ${open && "cursor-pointer justify-start gap-2 px-3"} `}
    >
      <span className="h-5 w-5">{icon}</span>

      <span
        className={`transition-[opacity,transform,width] ${
          open
            ? "w-auto translate-x-0 opacity-100"
            : "w-0 -translate-x-1 overflow-hidden opacity-0"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default function Sidebar({ open }: { open: boolean }) {
  return (
    <div className="h-full">
      <nav className="flex h-full flex-col justify-between">
        <div className="flex flex-col items-center gap-1 px-3 pt-3">
          <SidebarMainItem
            icon={
              <Image
                src="/images/house.svg"
                width={20}
                height={20}
                alt="home"
                unoptimized
                priority
              />
            }
            label="Home"
            open={open}
            selected
          />
          <SidebarMainItem
            icon={
              <Image
                src="/images/star.svg"
                width={20}
                height={20}
                alt="starred"
                unoptimized
                priority
              />
            }
            label="Starred"
            open={open}
          />
          <SidebarMainItem
            icon={
              <Image
                src="/images/share.svg"
                width={20}
                height={20}
                alt="shared"
                unoptimized
                priority
              />
            }
            label="Shared"
            open={open}
          />
          <SidebarMainItem
            icon={
              <Image
                src="/images/users-three.svg"
                width={20}
                height={20}
                alt="workspaces"
                unoptimized
                priority
              />
            }
            label="Workspaces"
            open={open}
          />
        </div>
        <div className="mb-2 flex flex-col items-center px-3">
          <div className="mb-4 w-9/10 border-t-1 border-gray-300" />
          <SidebarBottomItem
            icon={
              <Image
                src="/images/book.svg"
                width={18}
                height={18}
                alt="templates and apps"
                unoptimized
                priority
              />
            }
            label="Templates and apps"
            open={open}
          />
          <SidebarBottomItem
            icon={
              <Image
                src="/images/bag.svg"
                width={18}
                height={18}
                alt="marketplace"
                unoptimized
                priority
              />
            }
            label="Marketplace"
            open={open}
          />
          <SidebarBottomItem
            icon={
              <Image
                src="/images/upload.svg"
                width={18}
                height={18}
                alt="import"
                unoptimized
                priority
              />
            }
            label="Import"
            open={open}
          />
          <CreateProjectButton open={open} />
        </div>
      </nav>
    </div>
  );
}
