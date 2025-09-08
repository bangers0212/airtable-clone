"use client";

import Image from "next/image";

export default function NotificationButton() {
  return (
    <button
      aria-label="Notifications"
      className="group relative flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[15] border-1 border-gray-300 transition hover:bg-gray-200"
    >
      <Image
        src="/images/bell.svg"
        width={16}
        height={16}
        alt=""
        unoptimized
        priority
      />
      <span
        className="absolute top-full mt-1.5 hidden rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block"
        aria-hidden="true"
      >
        Notifications
      </span>
    </button>
  );
}
