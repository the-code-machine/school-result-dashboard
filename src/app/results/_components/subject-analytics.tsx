"use client";

import { useMemo } from "react";
import type {
  Student,
  StudentComputed,
  SubjectRule,
  ClassConfig,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  students: (Student & { computed: StudentComputed })[];
  subjects: SubjectRule[];
  classCfg: ClassConfig | null;
}

interface SubjectStats {
  code: number;
  name: string;
  appeared: number;
  passed: number;
  absent: number;
  passPct: number;
  avgTotal: number;
  highest: number;
  lowest: number;
  gradeMap: Record<string, number>;
}

export function SubjectAnalytics({ students, subjects, classCfg }: Props) {
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.code, s]));

  const stats = useMemo((): SubjectStats[] => {
    // collect all unique subject codes used
    const codeSet = new Set<number>();
    students.forEach((s) => s.marks.forEach((m) => codeSet.add(m.subjectCode)));

    return Array.from(codeSet).map((code) => {
      const rule = subjectMap[code];
      const name = rule?.name ?? `Code ${code}`;

      let appeared = 0;
      let passed = 0;
      let absent = 0;
      let totalSum = 0;
      let highest = 0;
      let lowest = Infinity;
      const gradeMap: Record<string, number> = {};

      students.forEach((student) => {
        const mark = student.marks.find((m) => m.subjectCode === code);
        if (!mark) return;

        const subResult = student.computed.subjectTotals.find(
          (t) => t.slot === mark.slot,
        );
        if (!subResult) return;

        if (mark.annual.isAbsent) {
          absent++;
          return;
        }

        appeared++;
        totalSum += subResult.total;

        if (subResult.isPassed) passed++;
        if (subResult.total > highest) highest = subResult.total;
        if (subResult.total < lowest) lowest = subResult.total;

        gradeMap[subResult.grade] = (gradeMap[subResult.grade] ?? 0) + 1;
      });

      return {
        code,
        name,
        appeared,
        passed,
        absent,
        passPct: appeared > 0 ? Math.round((passed / appeared) * 100) : 0,
        avgTotal:
          appeared > 0 ? Math.round((totalSum / appeared) * 10) / 10 : 0,
        highest,
        lowest: lowest === Infinity ? 0 : lowest,
        gradeMap,
      };
    });
  }, [students, subjectMap]);

  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-12 text-center gap-2">
        <p className="text-sm text-gray-400">No subject data yet</p>
      </div>
    );
  }

  const GRADES = ["A+", "A", "B", "C", "D", "E1", "E2"];

  const GRADE_BAR_COLOR: Record<string, string> = {
    "A+": "bg-emerald-500",
    A: "bg-green-500",
    B: "bg-blue-500",
    C: "bg-cyan-500",
    D: "bg-amber-500",
    E1: "bg-orange-500",
    E2: "bg-red-500",
  };

  return (
    <div className="space-y-4">
      {/* Summary overview table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Subject",
                "Appeared",
                "Passed",
                "Absent",
                "Pass %",
                "Average",
                "Highest",
                "Lowest",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.map((s, idx) => (
              <tr
                key={s.code}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    Code {s.code}
                  </p>
                </td>
                <td className="px-3 py-2.5 text-gray-700">{s.appeared}</td>
                <td className="px-3 py-2.5 font-semibold text-emerald-700">
                  {s.passed}
                </td>
                <td className="px-3 py-2.5 text-gray-500">{s.absent}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          s.passPct >= 75
                            ? "bg-emerald-500"
                            : s.passPct >= 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${s.passPct}%` }}
                      />
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        s.passPct >= 75
                          ? "text-emerald-700"
                          : s.passPct >= 50
                            ? "text-amber-700"
                            : "text-red-700"
                      }`}
                    >
                      {s.passPct}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-medium text-gray-800">
                  {s.avgTotal}
                </td>
                <td className="px-3 py-2.5 font-semibold text-blue-700">
                  {s.highest}
                </td>
                <td className="px-3 py-2.5 font-semibold text-red-600">
                  {s.lowest}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-subject grade distribution cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((s) => {
          const total = Object.values(s.gradeMap).reduce(
            (sum, v) => sum + v,
            0,
          );

          return (
            <Card key={s.code}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm">{s.name}</CardTitle>
                    <p className="text-xs text-gray-400 font-mono">
                      Code {s.code}
                    </p>
                  </div>
                  <Badge
                    variant={
                      s.passPct >= 75
                        ? "success"
                        : s.passPct >= 50
                          ? "warning"
                          : "destructive"
                    }
                    className="text-xs shrink-0"
                  >
                    {s.passPct}% pass
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {/* Grade bars */}
                {GRADES.map((grade) => {
                  const count = s.gradeMap[grade] ?? 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={grade} className="flex items-center gap-2">
                      <span className="w-6 text-xs font-bold text-gray-600 text-right shrink-0">
                        {grade}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            GRADE_BAR_COLOR[grade] ?? "bg-gray-400"
                          }`}
                          style={{ width: pct > 0 ? `${pct}%` : "0%" }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}

                {/* Quick stats row */}
                <div className="flex gap-3 pt-1 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
                  <span>
                    Avg:{" "}
                    <span className="font-semibold text-gray-800">
                      {s.avgTotal}
                    </span>
                  </span>
                  <span>
                    High:{" "}
                    <span className="font-semibold text-blue-700">
                      {s.highest}
                    </span>
                  </span>
                  <span>
                    Low:{" "}
                    <span className="font-semibold text-red-600">
                      {s.lowest}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
