"use client";

import Image from "next/image";

export default function SearchBar() {
  return (
    <button className="flex h-[32px] w-[340px] cursor-pointer items-center rounded-3xl border-1 border-gray-200 px-[16px] text-sm hover:shadow">
      <Image
        src="/images/search.svg"
        alt="Back"
        width={16}
        height={16}
        className="mr-2"
      />
      <div className="flex-1 text-left text-gray-500">Search...</div>
      <div className="text-gray-400">ctrl K</div>
    </button>
  );
}
