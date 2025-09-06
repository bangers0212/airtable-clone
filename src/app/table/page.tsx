"use client";

import Appbar from "./_components/Appbar";
import Sidebar from "./_components/Sidebar";

export default function ProjectPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Appbar />
        <main className="flex-1 bg-gray-50 p-4">
          <h1 className="text-xl font-semibold">Project content here</h1>
        </main>
      </div>
    </div>
  );
}
