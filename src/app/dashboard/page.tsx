"use server";

import { HydrateClient, api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import ProjectsGrid from "./_components/ProjectsGrid";
import HomeBanner from "./_components/HomeBanner";

export default async function SidebarWithNav() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  await api.project.listMine.prefetch();

  return (
    <HydrateClient>
      <div className="h-full w-full px-5">
        <div className="font mb-5 font-sans text-[20pt] font-bold">Home</div>
        <HomeBanner />
        <ProjectsGrid />
      </div>
    </HydrateClient>
  );
}
