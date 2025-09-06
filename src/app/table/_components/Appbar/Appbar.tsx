"use client";

import Tabs, { type Tab, type NonEmptyArray } from "~/app/_components/Tabs";
import ProjectDropdown from "./ProjectDropdown";
import HistoryButton from "./HistoryButton";
import LaunchButton from "./LaunchButton";
import ShareButton from "./ShareButton";

export default function Appbar() {
  const headerTabs: NonEmptyArray<Tab> = [
    { label: "Data", value: "Data", disabled: false },
    { label: "Automations", value: "Automations", disabled: false },
    { label: "Interfaces", value: "Interfaces", disabled: false },
    { label: "Forms", value: "Forms", disabled: false },
  ];

  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200">
      <ProjectDropdown />
      <Tabs tabs={headerTabs} />
      <div className="mr-4 flex gap-2">
        <HistoryButton />
        <LaunchButton />
        <ShareButton />
      </div>
    </div>
  );
}
