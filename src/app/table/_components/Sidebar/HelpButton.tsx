"use client";

import Image from "next/image";

export default function HelpButton() {
  return (
    <button
      aria-label="Help"
      className="group relative flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[14] transition hover:bg-gray-200"
    >
      <Image
        src="/images/question.svg"
        width={16}
        height={16}
        alt=""
        unoptimized
        priority
      />
      <span
        className="absolute left-full ml-1.5 hidden rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block"
        aria-hidden="true"
      >
        Help
      </span>
    </button>
  );
}
