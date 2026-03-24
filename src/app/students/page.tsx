"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useStudentsStore } from "@/store/students";
import { useSettingsStore } from "@/store/settings";
import { StudentTable } from "./_components/student-table";
import { StudentDialog } from "./_components/student-dialog";
import { StudentFilters } from "./_components/student-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, GraduationCap, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function StudentsContent() {
  const searchParams = useSearchParams();
  const preSession = searchParams.get("session") ?? "";

  const { sessions } = useSettingsStore();
  const { students } = useStudentsStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(preSession);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterGender, setFilterGender] = useState("all");

  // current session object
  const session = sessions.find((s) => s.id === selectedSession);

  // filtered students
  const filtered = useMemo(() => {
    return students
      .filter((s) => !selectedSession || s.sessionId === selectedSession)
      .filter((s) => {
        const q = search.toLowerCase();
        return (
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.includes(q) ||
          (s.scholarNumber ?? "").includes(q)
        );
      })
      .filter((s) =>
        filterCategory === "all" ? true : s.category === filterCategory,
      )
      .filter((s) =>
        filterGender === "all" ? true : s.gender === filterGender,
      )
      .filter((s) => {
        if (filterResult === "all") return true;
        return s.computed?.result === filterResult;
      });
  }, [
    students,
    selectedSession,
    search,
    filterResult,
    filterCategory,
    filterGender,
  ]);

  // stats for selected session
  const sessionStudents = students.filter(
    (s) => s.sessionId === selectedSession,
  );
  const passCount = sessionStudents.filter(
    (s) => s.computed?.result === "PASS",
  ).length;
  const pendingCount = sessionStudents.filter(
    (s) => !s.computed || s.computed.result === "PENDING",
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Students</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage student records per session
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 shrink-0"
          disabled={!selectedSession}
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Session selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm font-medium text-gray-700 shrink-0">Session:</p>
        {sessions.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="w-4 h-4" />
            No sessions yet —{" "}
            <a href="/sessions" className="underline font-medium">
              create one first
            </a>
          </div>
        ) : (
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-64 h-9">
              <SelectValue placeholder="Select a session..." />
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
        )}

        {session && (
          <Badge
            variant={session.isLocked ? "secondary" : "success"}
            className="text-xs"
          >
            {session.isLocked ? "Locked" : "Active"}
          </Badge>
        )}
      </div>

      {/* Mini stats — only when session selected */}
      {selectedSession && sessionStudents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: sessionStudents.length,
              color: "text-blue-700",
              bg: "bg-blue-50",
            },
            {
              label: "Passed",
              value: passCount,
              color: "text-emerald-700",
              bg: "bg-emerald-50",
            },
            {
              label: "Pending",
              value: pendingCount,
              color: "text-amber-700",
              bg: "bg-amber-50",
            },
            {
              label: "Pass %",
              value:
                sessionStudents.length > 0
                  ? Math.round((passCount / sessionStudents.length) * 100) + "%"
                  : "—",
              color: "text-violet-700",
              bg: "bg-violet-50",
            },
          ].map((stat) => (
            <Card key={stat.label} className={`border-0 ${stat.bg}`}>
              <CardContent className="p-3">
                <p className={`text-xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No session selected */}
      {!selectedSession ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <GraduationCap className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-600">
            Select a session to view students
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Choose a session from the dropdown above
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <StudentFilters
            search={search}
            onSearch={setSearch}
            filterResult={filterResult}
            onFilterResult={setFilterResult}
            filterCategory={filterCategory}
            onFilterCategory={setFilterCategory}
            filterGender={filterGender}
            onFilterGender={setFilterGender}
            total={filtered.length}
          />

          {/* Table */}
          <StudentTable
            students={filtered}
            sessionId={selectedSession}
            isSessionLocked={session?.isLocked ?? false}
          />
        </>
      )}

      {/* Add student dialog */}
      {selectedSession && (
        <StudentDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          sessionId={selectedSession}
          existingRolls={sessionStudents.map((s) => s.rollNumber)}
        />
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={<div className="p-4 text-sm text-gray-500">Loading...</div>}
      >
        <StudentsContent />
      </Suspense>
    </AppShell>
  );
}
