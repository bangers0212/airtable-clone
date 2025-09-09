"use client";

import BackButton from "./BackButton";
import HelpButton from "./HelpButton";
import NotificationsButton from "./NotificationsButton";
import AccountMenuButton from "./AccountMenuButton";

export default function Sidebar() {
  return (
    <aside className="sticky top-0 row-span-2 flex h-screen flex-col items-center justify-between border-r border-gray-200 bg-white px-[8px] py-[16px]">
      <div className="flex flex-col items-center gap-4">
        <BackButton />
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* help button, bell button, account button */}
        <HelpButton />
        <NotificationsButton />
        <AccountMenuButton />
      </div>
    </aside>
  );
}
