"use client";

import Image from "next/image";
import { api } from "~/trpc/react";

export default function CreateProjectButton({ open }: { open: boolean }) {
  const utils = api.useUtils();

  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      void utils.project.listMine.invalidate();
    },
  });

  return (
    <button
      onClick={() => createProject.mutate()}
      className={`mt-1 flex cursor-pointer items-center justify-center gap-2 rounded ${open ? "my-3 mt-3 h-[32px] w-full bg-blue-500" : "border-1 border-gray-300"}`}
    >
      <Image
        src="/images/plus.svg"
        alt="Back"
        width={16}
        height={16}
        className="m-0.5"
      />
      {open && <div className="text-sm text-white">Create</div>}
    </button>
  );
}
