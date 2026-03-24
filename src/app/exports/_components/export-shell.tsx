"use client";

import { useState, useMemo } from "react";
import { useSettingsStore } from "@/store/settings";
import { useStudentsStore } from "@/store/students";
import { assignRanks } from "@/lib/compute";
import {
  exportDEOProforma,
  exportVimarshFormat,
  exportRMSAFormat,
} from "@/lib/export-utils";
import type { Student, StudentComputed } from "@/types";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileSpreadsheet,
  Building,
  FileText,
  AlertCircle,
  Printer,
} from "lucide-react";

export function ExportShell() {
  const { sessions, school, subjects } = useSettingsStore();
  const { students } = useStudentsStore();
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState(sessions[0]?.id ?? "");

  const session = sessions.find((s) => s.id === selectedSession);

  // Get computed students for the selected session
  const sessionStudents = useMemo(() => {
    const raw = students.filter(
      (s) => s.sessionId === selectedSession && s.computed,
    ) as (Student & { computed: StudentComputed })[];

    // Sort by roll number for exports
    const ranked = assignRanks(raw);
    return ranked.sort((a, b) =>
      a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }),
    );
  }, [students, selectedSession]);

  const handleExport = (type: "DEO" | "VIMARSH" | "RMSA") => {
    if (!session || sessionStudents.length === 0) return;

    if (type === "DEO") {
      exportDEOProforma(sessionStudents, school, session);
    } else if (type === "VIMARSH") {
      exportVimarshFormat(sessionStudents, school, session, subjects);
    } else if (type === "RMSA") {
      exportRMSAFormat(sessionStudents, school, session);
    }
  };

  const isReady = !!session && sessionStudents.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Data Exports</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Generate CSV files formatted for government portals and administrative
          reporting.
        </p>
      </div>

      {/* Session Selection */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4 flex-wrap">
          <p className="text-sm font-semibold text-gray-700">
            Select Exam Session:
          </p>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Choose session..." />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  Class {s.classId}
                  {s.stream && s.stream !== "NA" ? ` · ${s.stream}` : ""}
                  {s.section ? ` · Sec ${s.section}` : ""} — {s.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {sessionStudents.length > 0 ? (
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
              {sessionStudents.length} computed records ready
            </span>
          ) : selectedSession ? (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> No computed records
            </span>
          ) : null}
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Vimarsh Portal */}
        <Card
          className={`transition-all ${isReady ? "hover:border-blue-300 hover:shadow-md" : "opacity-70"}`}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-base">Vimarsh Portal</CardTitle>
            <CardDescription className="text-xs">
              Main grading sheet containing detailed subject-wise marks, totals,
              and final grades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full gap-2"
              disabled={!isReady}
              onClick={() => handleExport("VIMARSH")}
            >
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        {/* DEO Proforma */}
        <Card
          className={`transition-all ${isReady ? "hover:border-violet-300 hover:shadow-md" : "opacity-70"}`}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-2">
              <Building className="w-5 h-5 text-violet-600" />
            </div>
            <CardTitle className="text-base">DEO Proforma</CardTitle>
            <CardDescription className="text-xs">
              District Education Officer summary format with statuses,
              divisions, and percentages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full gap-2 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
              disabled={!isReady}
              onClick={() => handleExport("DEO")}
            >
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        {/* RMSA Format */}
        <Card
          className={`transition-all ${isReady ? "hover:border-emerald-300 hover:shadow-md" : "opacity-70"}`}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <CardTitle className="text-base">RMSA Format</CardTitle>
            <CardDescription className="text-xs">
              Requires SSSMID and Enrolment numbers mapped against pass/fail
              criteria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full gap-2 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              disabled={!isReady}
              onClick={() => handleExport("RMSA")}
            >
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Print Marksheets */}
        <Card
          className={`transition-all ${isReady ? "hover:border-indigo-300 hover:shadow-md" : "opacity-70"}`}
        >
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-2">
              <Printer className="w-5 h-5 text-indigo-600" />
            </div>
            <CardTitle className="text-base">Bulk Marksheets</CardTitle>
            <CardDescription className="text-xs">
              Generate print-ready individual marksheets (front and back) for
              the entire class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full gap-2 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
              disabled={!isReady}
              onClick={() =>
                router.push(`/print/bulk-marksheet/${selectedSession}`)
              }
            >
              <Printer className="w-4 h-4" /> Print All Marksheets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
