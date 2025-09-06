"use client";

import Image from "next/image";

export default function HistoryButton() {
  return (
    <button
      aria-label="Open history"
      className="group relative flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[14] transition hover:bg-gray-200"
    >
      <Image
        src="/images/history-button.svg"
        width={16}
        height={16}
        alt=""
        unoptimized
        priority
      />
      <span
        className="absolute top-full mt-1.5 hidden rounded bg-black px-2 py-1 text-sm whitespace-nowrap text-white group-hover:block"
        aria-hidden="true"
      >
        Base history
      </span>
    </button>
  );
}
