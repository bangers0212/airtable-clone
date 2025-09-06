"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "next/image";
import { HiOutlineChevronDown } from "react-icons/hi2";

export default function ProjectDropdown() {
  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton className="inline-flex cursor-pointer items-center justify-center gap-x-2 rounded-md bg-white/10 px-3 py-2 text-lg font-bold focus:outline-none">
        <div className="rounded-md bg-gray-500 p-[5]">
          <Image
            src="/images/projectdrop-logo.svg"
            width={24}
            height={24}
            alt="Project logo"
            unoptimized
            priority
          />
        </div>
        Untitled Base
        <HiOutlineChevronDown
          aria-hidden="true"
          className="size-4 text-gray-600"
        />
      </MenuButton>

      <MenuItems
        transition
        className="absolute left-2 z-10 mt-3 w-100 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.15)] outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="px-4 py-1">
          <MenuItem>
            <div className="block border-b border-gray-200 px-2 py-1 text-xl data-focus:bg-white/5">
              Title
            </div>
          </MenuItem>
        </div>
        <div className="px-4 py-1">
          <MenuItem>
            <div className="block border-b border-gray-200 px-2 py-1 data-focus:bg-white/5">
              Appearance
            </div>
          </MenuItem>
        </div>
        <div className="px-4 py-1">
          <MenuItem>
            <div className="block px-2 py-1 data-focus:bg-white/5">
              Base guide
            </div>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
