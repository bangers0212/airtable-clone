"use client";

import Appbar from "./_components/Appbar";
import Sidebar from "./_components/Sidebar";
import TableManagementComponent from "./_components/TableManagementComponent";

export default function ProjectPage() {
  return (
    <div className="grid-rows[56px_1fr] grid h-screen grid-cols-[56px_1fr] overflow-hidden bg-gray-50">
      <Sidebar />
      <Appbar />

      <main className="col-start-2 overflow-hidden bg-gray-50">
        <div className="h-full overflow-auto">
          <TableManagementComponent />
        </div>
      </main>
    </div>
  );
}
