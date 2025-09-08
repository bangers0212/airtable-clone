"use client";

import Image from "next/image";
import SearchBar from "./SearchBar";
import HelpButton from "./HelpButton";
import NotificationButton from "./NotificationButton";
import AccountDrop from "./AccountDrop";

export default function Appbar({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-1 pr-3 shadow-sm">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          className="group relative cursor-pointer rounded p-2 text-gray-400 hover:text-gray-900 focus:outline-none"
        >
          <Image
            src="/images/list.svg"
            width={22}
            height={22}
            alt="sidebar hamburger"
            unoptimized
            priority
          />
          <span
            className="absolute top-full mt-1.5 mr-3.5 hidden rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block"
            aria-hidden="true"
          >
            {sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          </span>
        </button>
        <div className="ml-3 cursor-pointer">
          <Image
            src="/images/logo-text.svg"
            width={102}
            height={22}
            alt="logo text"
            unoptimized
            priority
          />
        </div>
      </div>
      <SearchBar />
      <div className="flex gap-3">
        <HelpButton />
        <NotificationButton />
        <AccountDrop />
      </div>
    </header>
  );
}
