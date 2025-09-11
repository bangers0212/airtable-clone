"use client";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function ProjectsGrid() {
  const { data: projects = [], isLoading } = api.project.listMine.useQuery();

  if (isLoading) return <div>Loading…</div>;
  if (!projects.length) return <div>No projects yet</div>;

  return (
    <div className="my-2 flex flex-col gap-5">
      <div className="text-gray-600">Opened anytime:</div>
      <ul className="grid min-w-[450px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((p) => {
          const initials = p.name.slice(0, 2);
          const bgColor = p.color;

          const lastAccessed = new Date(p.lastAccessedAt);
          const diffMs = Date.now() - lastAccessed.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          let lastAccessedLabel = "";

          if (diffMins < 1) {
            lastAccessedLabel = "Opened just now";
          } else if (diffMins < 60) {
            lastAccessedLabel = `Opened ${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
          } else if (diffMins < 60 * 24) {
            const hrs = Math.floor(diffMins / 60);
            lastAccessedLabel = `Opened ${hrs} hour${hrs > 1 ? "s" : ""} ago`;
          } else {
            lastAccessedLabel = `Opened ${new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(lastAccessed)}`;
          }

          return (
            <li key={p.id}>
              <Link
                className="flex h-[92px] items-center gap-3 rounded border-1 border-gray-300 bg-white p-3 shadow-sm hover:shadow"
                href={`/table/${p.id}`}
              >
                <div
                  className="flex h-[56px] w-[56px] items-center justify-center rounded-lg text-2xl text-white"
                  style={{ backgroundColor: bgColor }}
                >
                  {initials}
                </div>
                <div>
                  <div className="truncate text-sm">{p.name}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {lastAccessedLabel}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
