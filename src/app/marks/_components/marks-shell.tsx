"use client";

import { useState, useEffect, useCallback } from "react";
import { useStudentsStore } from "@/store/students";
import { useSettingsStore } from "@/store/settings";
import { computeStudent } from "@/lib/compute";
import { toast } from "@/hooks/use-toast";
import type { SubjectMarks } from "@/types";
import { SubjectSlotPicker } from "./subject-slot-picker";
import { MarksEntryRow } from "./marks-entry-row";
import { ResultPreview } from "./result-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Props {
  studentId: string;
  sessionId: string;
}

export function MarksShell({ studentId, sessionId }: Props) {
  const { students, updateStudent, saveMarks, getBySession } =
    useStudentsStore();
  const { sessions, classConfigs, subjects } = useSettingsStore();

  // resolve session + student
  const session = sessions.find((s) => s.id === sessionId);
  const student = students.find((s) => s.id === studentId);

  // session students for prev/next navigation
  const sessionStudents = getBySession(sessionId)
    .slice()
    .sort((a, b) =>
      a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }),
    );

  const currentIdx = sessionStudents.findIndex((s) => s.id === studentId);
  const prevStudent = currentIdx > 0 ? sessionStudents[currentIdx - 1] : null;
  const nextStudent =
    currentIdx < sessionStudents.length - 1
      ? sessionStudents[currentIdx + 1]
      : null;

  // local marks state — initialised from store
  const [marks, setMarks] = useState<SubjectMarks[]>(student?.marks ?? []);
  const [isDirty, setIsDirty] = useState(false);

  // reset when student changes
  useEffect(() => {
    setMarks(student?.marks ?? []);
    setIsDirty(false);
  }, [studentId, student?.marks]);

  const classCfg = session ? classConfigs[session.classId] : null;
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.code, s]));

  // ── subject slot updates ──────────────────────────────────────────────────
  const handleSlotChange = (slot: number, code: number) => {
    setMarks((prev) => {
      const existing = prev.find((m) => m.slot === slot);
      if (existing) {
        return prev.map((m) =>
          m.slot === slot ? { ...m, subjectCode: code } : m,
        );
      }
      const newMark: SubjectMarks = {
        slot,
        subjectCode: code,
        annual: { th: null, pr: null, isAbsent: false },
        graceMarks: 0,
      };
      return [...prev, newMark].sort((a, b) => a.slot - b.slot);
    });
    setIsDirty(true);
  };

  // ── marks updates ─────────────────────────────────────────────────────────
  const handleMarksChange = (updated: SubjectMarks) => {
    setMarks((prev) =>
      prev.map((m) => (m.slot === updated.slot ? updated : m)),
    );
    setIsDirty(true);
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!student || !classCfg) return;

    saveMarks(student.id, marks);

    // recompute result
    const computed = computeStudent(
      { ...student, marks },
      subjectMap,
      classCfg,
    );
    updateStudent(student.id, { computed });
    setIsDirty(false);

    toast({
      variant: "success",
      title: "Saved",
      description: `Marks saved for ${student.name}.`,
    });
  }, [student, marks, classCfg, subjectMap, saveMarks, updateStudent]);

  // ── no session / student ──────────────────────────────────────────────────
  if (!sessionId || !studentId) {
    return (
      <div className="max-w-4xl mx-auto">
        <NoSelectionState sessions={sessions} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon={<AlertCircle className="w-10 h-10 text-gray-300" />}
          title="Session not found"
          desc="This session may have been deleted."
          action={
            <Link href="/sessions">
              <Button size="sm">Go to Sessions</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon={<User className="w-10 h-10 text-gray-300" />}
          title="Student not found"
          desc="Select a student from the students list."
          action={
            <Link href={`/students?session=${sessionId}`}>
              <Button size="sm">Go to Students</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isLocked = session.isLocked || student.isLocked;

  // live preview computation
  const liveComputed =
    classCfg && marks.length > 0
      ? computeStudent({ ...student, marks }, subjectMap, classCfg)
      : student.computed;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href={`/students?session=${sessionId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600">
              <ChevronLeft className="w-4 h-4" />
              Students
            </Button>
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div>
            <p className="text-base font-bold text-gray-900">{student.name}</p>
            <p className="text-xs text-gray-500">
              Roll {student.rollNumber} · Class {session.classId}
              {session.stream !== "NA" ? ` · ${session.stream}` : ""} ·{" "}
              {session.year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLocked && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="w-3 h-3" /> Locked
            </Badge>
          )}
          {isDirty && !isLocked && (
            <Badge variant="warning" className="text-xs">
              Unsaved changes
            </Badge>
          )}
          <Button
            size="sm"
            disabled={!isDirty || isLocked}
            onClick={handleSave}
            className="gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Marks
          </Button>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>
          {prevStudent ? (
            <Link
              href={`/marks?student=${prevStudent.id}&session=${sessionId}`}
              className="flex items-center gap-1 hover:text-blue-600 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {prevStudent.name} (Roll {prevStudent.rollNumber})
            </Link>
          ) : (
            <span className="text-gray-300">First student</span>
          )}
        </div>
        <span>
          {currentIdx + 1} / {sessionStudents.length}
        </span>
        <div>
          {nextStudent ? (
            <Link
              href={`/marks?student=${nextStudent.id}&session=${sessionId}`}
              className="flex items-center gap-1 hover:text-blue-600 font-medium"
            >
              {nextStudent.name} (Roll {nextStudent.rollNumber})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="text-gray-300">Last student</span>
          )}
        </div>
      </div>

      {/* Locked warning */}
      {isLocked && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <Lock className="w-4 h-4 shrink-0" />
          This session is locked. Marks cannot be edited.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left — subject slots + marks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Subject slot picker */}
          {classCfg && (
            <SubjectSlotPicker
              slots={classCfg.maxSubjectSlots}
              marks={marks}
              subjects={subjects}
              onSlotChange={handleSlotChange}
              disabled={isLocked}
            />
          )}

          {/* Marks entry rows */}
          {marks.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400">
                Assign subjects above to start entering marks
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {marks
                .slice()
                .sort((a, b) => a.slot - b.slot)
                .map((m) => {
                  const rule = subjectMap[m.subjectCode];
                  if (!rule) return null;
                  return (
                    <MarksEntryRow
                      key={m.slot}
                      marks={m}
                      rule={rule}
                      classCfg={classCfg!}
                      onChange={handleMarksChange}
                      disabled={isLocked}
                    />
                  );
                })}
            </div>
          )}
        </div>

        {/* Right — result preview */}
        <div className="space-y-4">
          <ResultPreview
            computed={liveComputed}
            classCfg={classCfg}
            studentName={student.name}
          />
        </div>
      </div>
    </div>
  );
}

// ── small helpers ─────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center gap-3">
      {icon}
      <p className="text-sm font-semibold text-gray-600">{title}</p>
      <p className="text-xs text-gray-400">{desc}</p>
      {action}
    </div>
  );
}

function NoSelectionState({
  sessions,
}: {
  sessions: ReturnType<typeof useSettingsStore>["sessions"];
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">
        Select a session and student to enter marks
      </p>
      {sessions.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="w-4 h-4" />
          No sessions yet —{" "}
          <Link href="/sessions" className="underline font-medium">
            create one first
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <Link key={s.id} href={`/students?session=${s.id}`}>
              <Card className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Class {s.classId}
                      {s.stream !== "NA" ? ` · ${s.stream}` : ""}
                      {s.section ? ` · Sec ${s.section}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">{s.year}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
