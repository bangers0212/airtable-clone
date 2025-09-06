"use client";

import { FaArrowLeftLong } from "react-icons/fa6";
import Image from "next/image";

export default function BackButton() {
  return (
    <button
      aria-label="Back"
      className="group relative flex h-[24px] w-[24px] cursor-pointer items-center justify-center overflow-visible"
    >
      <Image
        src="/images/sidebar-logo.svg"
        alt="Back"
        width={22}
        height={22}
        className="transition-transform duration-300 group-hover:scale-0"
      />
      <FaArrowLeftLong
        className="absolute m-auto scale-0 transition-all duration-100 group-hover:scale-100"
        size={12}
      />
      <span
        className="absolute left-full z-50 ml-1.5 hidden rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block"
        aria-hidden="true"
      >
        Back to home
      </span>
    </button>
  );
}
