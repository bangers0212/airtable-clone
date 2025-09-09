"use client";

export default function AccountMenuButton() {
  return (
    <button
      aria-label="Account"
      className="group relative flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[14] border-1 border-gray-200 bg-gray-200"
    >
      B
      <span
        className="absolute left-full ml-1.5 hidden rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block"
        aria-hidden="true"
      >
        Account
      </span>
    </button>
  );
}
