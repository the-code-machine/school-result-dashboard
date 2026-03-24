"use client";

import { useState, useMemo } from "react";
import { useStudentsStore } from "@/store/students";
import { useSettingsStore } from "@/store/settings";
import { assignRanks } from "@/lib/compute";
import type { Student, StudentComputed } from "@/types";
import { ResultTable } from "./result-table";
import { MeritList } from "./merit-list";
import { SubjectAnalytics } from "./subject-analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Trophy,
  BookOpen,
  GraduationCap,
  AlertCircle,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import Link from "next/link";

export function ResultsShell() {
  const { sessions, classConfigs, subjects } = useSettingsStore();
  const { students } = useStudentsStore();

  const [selectedSession, setSelectedSession] = useState(sessions[0]?.id ?? "");

  const session = sessions.find((s) => s.id === selectedSession);
  const classCfg = session ? classConfigs[session.classId] : null;

  // students for this session with computed results
  const sessionStudents = useMemo(() => {
    const raw = students.filter(
      (s) => s.sessionId === selectedSession && s.computed,
    ) as (Student & { computed: StudentComputed })[];

    // assign ranks
    return assignRanks(raw);
  }, [students, selectedSession]);

  // summary stats
  const stats = useMemo(() => {
    const total = sessionStudents.length;
    const appeared = sessionStudents.filter(
      (s) => s.computed.result !== "ABSENT",
    ).length;
    const passed = sessionStudents.filter(
      (s) => s.computed.result === "PASS",
    ).length;
    const failed = sessionStudents.filter(
      (s) => s.computed.result === "FAIL",
    ).length;
    const suppl = sessionStudents.filter(
      (s) => s.computed.result === "SUPPLEMENTARY",
    ).length;
    const absent = sessionStudents.filter(
      (s) => s.computed.result === "ABSENT",
    ).length;
    const passPct = appeared > 0 ? Math.round((passed / appeared) * 100) : 0;

    return { total, appeared, passed, failed, suppl, absent, passPct };
  }, [sessionStudents]);

  // no sessions at all
  if (sessions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center gap-3">
        <GraduationCap className="w-10 h-10 text-gray-300" />
        <p className="text-sm font-semibold text-gray-600">No sessions yet</p>
        <p className="text-xs text-gray-400">
          Create a session and enter marks first
        </p>
        <Link
          href="/sessions"
          className="text-xs text-blue-600 underline font-medium"
        >
          Go to Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Results</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Computed results, merit list and analytics
          </p>
        </div>

        {/* Session selector */}
        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-72 h-9">
            <SelectValue placeholder="Select session..." />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                Class {s.classId}
                {s.stream && s.stream !== "NA" ? ` · ${s.stream}` : ""}
                {s.section ? ` · Sec ${s.section}` : ""} — {s.year}
                {s.isLocked ? " 🔒" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No students with results */}
      {sessionStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-14 text-center gap-3">
          <AlertCircle className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-600">
            No computed results yet
          </p>
          <p className="text-xs text-gray-400">
            Enter marks for students and save — results compute automatically
          </p>
          <Link
            href={`/students?session=${selectedSession}`}
            className="text-xs text-blue-600 underline font-medium"
          >
            Go to Students
          </Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Total",
                value: stats.total,
                icon: Users,
                color: "text-gray-700",
                bg: "bg-gray-50",
              },
              {
                label: "Appeared",
                value: stats.appeared,
                icon: GraduationCap,
                color: "text-blue-700",
                bg: "bg-blue-50",
              },
              {
                label: "Passed",
                value: stats.passed,
                icon: CheckCircle2,
                color: "text-emerald-700",
                bg: "bg-emerald-50",
              },
              {
                label: "Failed",
                value: stats.failed,
                icon: XCircle,
                color: "text-red-700",
                bg: "bg-red-50",
              },
              {
                label: "Suppl.",
                value: stats.suppl,
                icon: AlertTriangle,
                color: "text-amber-700",
                bg: "bg-amber-50",
              },
              {
                label: "Pass %",
                value: stats.passPct + "%",
                icon: BarChart3,
                color: "text-violet-700",
                bg: "bg-violet-50",
              },
            ].map((stat) => (
              <Card key={stat.label} className={`border-0 ${stat.bg}`}>
                <CardContent className="p-3 flex items-center gap-2">
                  <stat.icon className={`w-4 h-4 shrink-0 ${stat.color}`} />
                  <div>
                    <p
                      className={`text-lg font-black leading-none ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="results">
            <TabsList className="flex w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
              <TabsTrigger
                value="results"
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Result Sheet
              </TabsTrigger>
              <TabsTrigger
                value="merit"
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <Trophy className="w-3.5 h-3.5" />
                Merit List
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Subject Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <ResultTable
                students={sessionStudents}
                subjects={subjects}
                classCfg={classCfg}
              />
            </TabsContent>

            <TabsContent value="merit">
              <MeritList students={sessionStudents} />
            </TabsContent>

            <TabsContent value="analytics">
              <SubjectAnalytics
                students={sessionStudents}
                subjects={subjects}
                classCfg={classCfg}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
