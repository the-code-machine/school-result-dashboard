"use client";

import type { Session } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Lock, Unlock, Calendar } from "lucide-react";

interface Props {
  sessions: Session[];
}

export function SessionStats({ sessions }: Props) {
  const active = sessions.filter((s) => !s.isLocked).length;
  const locked = sessions.filter((s) => s.isLocked).length;
  const classes = [...new Set(sessions.map((s) => s.classId))].length;

  const latest = sessions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

  const stats = [
    {
      label: "Total Sessions",
      value: sessions.length,
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active",
      value: active,
      icon: Unlock,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Locked",
      value: locked,
      icon: Lock,
      color: "text-gray-500",
      bg: "bg-gray-100",
    },
    {
      label: "Classes Used",
      value: classes,
      icon: Calendar,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.bg} shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 truncate">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
