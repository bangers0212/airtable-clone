"use client";

import { useState } from "react";

export type NonEmptyArray<T> = [T, ...T[]];

export interface Tab {
  label: string;
  value: string;
  disabled: boolean;
}

interface TabsProps {
  tabs: NonEmptyArray<Tab>;
  initialTab?: string;
  onTabChange?: (value: string) => void;
}

// TailwindCSS+ Tab Component Wrapper
export default function Tabs({ tabs, initialTab, onTabChange }: TabsProps) {
  const [selected, setSelected] = useState(initialTab ?? tabs[0].value);

  const handleSelect = (value: string) => {
    setSelected(value);
    if (onTabChange) onTabChange(value);
  };

  return (
    <div>
      <nav aria-label="Tabs" className="-mb-px flex space-x-2">
        {tabs.map((tab) => {
          const isCurrent = selected === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                handleSelect(tab.value);
              }}
              className={`cursor-pointer border-b-2 px-1 py-4 text-sm font-normal whitespace-nowrap transition ${
                isCurrent
                  ? "border-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
              aria-current={isCurrent ? "page" : undefined}
              disabled={tab.disabled}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
