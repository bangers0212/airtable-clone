"use client";

import Image from "next/image";

export default function LaunchButton() {
  return (
    <button
      aria-label="Open launch"
      className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-gray-300 px-[8px] text-sm shadow-xs transition hover:border-[#b6bcc5] hover:shadow-sm"
    >
      <Image
        src="/images/launch-button.svg"
        width={16}
        height={16}
        alt=""
        unoptimized
        priority
      />
      Launch
    </button>
  );
}
