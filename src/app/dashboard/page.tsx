import { AppShell } from "@/components/layout/app-shell";
import {
  Users,
  BookOpen,
  TrendingUp,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const STAT_CARDS = [
  {
    label: "Total Students",
    value: "—",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "/students",
  },
  {
    label: "Active Sessions",
    value: "—",
    icon: GraduationCap,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "/sessions",
  },
  {
    label: "Marks Pending",
    value: "—",
    icon: BookOpen,
    color: "text-amber-600",
    bg: "bg-amber-50",
    href: "/marks",
  },
  {
    label: "Pass %",
    value: "—",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
    href: "/results",
  },
];

const QUICK_LINKS = [
  {
    title: "Setup School Info",
    description: "Add school name, DISE code, principal",
    href: "/settings?tab=school",
    icon: GraduationCap,
    status: "action",
  },
  {
    title: "Configure Classes",
    description: "Set marking scheme for Class 9, 11 etc.",
    href: "/settings?tab=classes",
    icon: BookOpen,
    status: "action",
  },
  {
    title: "Manage Subjects",
    description: "Add or edit subject codes and pass marks",
    href: "/settings?tab=subjects",
    icon: CheckCircle,
    status: "action",
  },
  {
    title: "Create Session",
    description: "Start a new exam session for a class",
    href: "/sessions",
    icon: Clock,
    status: "action",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">
                Nehru Memorial Higher Secondary School
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">
                DISE: 23310300104 · Kurwai, Vidisha (MP) · MPBSE: 622055
              </p>
              <p className="text-blue-200 text-xs mt-2">
                Result Management System · Session 2024-25
              </p>
            </div>
            <GraduationCap className="w-10 h-10 text-blue-300 shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <Link key={card.label} href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        {card.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {card.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${card.bg} shrink-0`}>
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick start */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Quick Setup</h3>
            <Link
              href="/settings"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              All settings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Info notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Getting Started
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Start by going to{" "}
                <Link href="/settings" className="underline font-medium">
                  Settings
                </Link>{" "}
                to configure your school info, class marking schemes, and
                subject master before creating sessions or entering marks.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
