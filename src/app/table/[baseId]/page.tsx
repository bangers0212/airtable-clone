"use server";

import Appbar from "./_components/Appbar";
import Sidebar from "./_components/Sidebar";
import TableManagementComponent from "./_components/TableManagementComponent";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ baseId: string }>;
}) {
  const { baseId } = await params;

  return (
    <div className="grid h-screen grid-cols-[56px_1fr] grid-rows-[56px_1fr] overflow-hidden bg-gray-50">
      <Sidebar />
      <Appbar />

      <main className="col-start-2 overflow-hidden">
        <div className="h-full overflow-hidden">
          <TableManagementComponent projectId={baseId} />
        </div>
      </main>
    </div>
  );
}
