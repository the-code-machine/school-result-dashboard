"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  FileSpreadsheet,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
    ],
  },
  {
    label: "Exam Management",
    items: [
      {
        href: "/sessions",
        icon: GraduationCap,
        label: "Sessions",
        description: "Manage exam sessions",
      },
      {
        href: "/students",
        icon: Users,
        label: "Students",
        description: "Student records",
      },
      {
        href: "/marks",
        icon: BookOpen,
        label: "Marks Entry",
        description: "Enter exam marks",
      },
    ],
  },
  {
    label: "Results & Reports",
    items: [
      {
        href: "/results",
        icon: BarChart3,
        label: "Results",
        description: "View computed results",
      },
      {
        href: "/exports",
        icon: FileSpreadsheet,
        label: "Exports",
        description: "RMSA, Vimarsh, DEO",
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        href: "/settings",
        icon: Settings,
        label: "Settings",
        description: "School, subjects, classes",
      },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out",
          "lg:translate-x-0 lg:z-30",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                Result Manager
              </p>
              <p className="text-xs text-gray-500 truncate">MPBSE System</p>
            </div>
          </div>
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 shrink-0",
                            active
                              ? "text-blue-700"
                              : "text-gray-400 group-hover:text-gray-600",
                          )}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {active && (
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 shrink-0">
          <p className="text-[11px] text-gray-400 text-center">
            Nehru Memorial HSS · Kurwai
          </p>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
