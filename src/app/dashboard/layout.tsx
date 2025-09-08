"use client";

import { useState } from "react";
import Appbar from "./_components/Appbar";
import Sidebar from "./_components/Sidebar";

const W_CLOSED = "48px";
const W_OPEN = "300px";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovering, setHovering] = useState(false);

  const expanded = sidebarOpen || hovering;

  return (
    <div
      className="grid h-screen [grid-template-columns:var(--sidebar-w)_1fr] [grid-template-rows:56px_1fr] overflow-hidden bg-gray-50"
      style={{ ["--sidebar-w" as string]: expanded ? W_OPEN : W_CLOSED }}
    >
      <header className="z-50 col-span-2 row-start-1">
        <Appbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
      </header>

      <aside
        className="z-40 col-start-1 row-start-2 overflow-y-auto border-r border-gray-200 bg-white shadow-sm"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <Sidebar open={expanded} />
      </aside>

      <main className="col-start-2 row-start-2 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
