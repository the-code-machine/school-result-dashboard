"use client";

import { SidebarToggle } from "./sidebar";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of results and activity",
  },
  "/sessions": {
    title: "Sessions",
    subtitle: "Manage exam sessions per class",
  },
  "/students": {
    title: "Students",
    subtitle: "Student records and enrollment",
  },
  "/marks": { title: "Marks Entry", subtitle: "Enter and edit exam marks" },
  "/results": { title: "Results", subtitle: "Computed results and merit list" },
  "/exports": {
    title: "Exports",
    subtitle: "Download RMSA, Vimarsh, DEO formats",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Configure school, classes, subjects",
  },
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  const key = Object.keys(PAGE_TITLES).find(
    (k) => pathname === k || (k !== "/dashboard" && pathname.startsWith(k)),
  );
  const meta = key
    ? PAGE_TITLES[key]
    : { title: "Result Manager", subtitle: "" };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
      {/* Mobile menu toggle */}
      <SidebarToggle onClick={onMenuClick} />

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-900 leading-tight">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="text-xs text-gray-500 truncate hidden sm:block">
            {meta.subtitle}
          </p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hidden sm:flex">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative">
          <Bell className="w-4 h-4" />
        </button>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
