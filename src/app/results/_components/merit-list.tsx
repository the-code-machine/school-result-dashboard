"use client";

import { useMemo } from "react";
import type { Student, StudentComputed } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, CheckCircle2, Star } from "lucide-react";

interface Props {
  students: (Student & { computed: StudentComputed })[];
}

const GRADE_BG: Record<string, string> = {
  "A+": "bg-emerald-500 text-white",
  A: "bg-green-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-cyan-600 text-white",
  D: "bg-amber-500 text-white",
  E1: "bg-orange-500 text-white",
  E2: "bg-red-500 text-white",
};

const RANK_ICON = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return null;
};

const RANK_ROW_BG = (rank: number) => {
  if (rank === 1) return "bg-yellow-50 border-yellow-200";
  if (rank === 2) return "bg-gray-50 border-gray-200";
  if (rank === 3) return "bg-amber-50 border-amber-200";
  return "bg-white border-gray-100";
};

export function MeritList({ students }: Props) {
  const passers = useMemo(() => {
    return students
      .filter((s) => s.computed.result === "PASS")
      .sort((a, b) => {
        const rDiff = (a.computed.rank ?? 999) - (b.computed.rank ?? 999);
        if (rDiff !== 0) return rDiff;
        return b.computed.percentage - a.computed.percentage;
      });
  }, [students]);

  const nonPassers = useMemo(() => {
    return students.filter((s) => s.computed.result !== "PASS");
  }, [students]);

  if (passers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-12 text-center gap-2">
        <Trophy className="w-10 h-10 text-gray-300" />
        <p className="text-sm font-semibold text-gray-600">
          No passed students yet
        </p>
        <p className="text-xs text-gray-400">
          Enter and save marks to generate merit list
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top 3 podium */}
      {passers.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {passers.slice(0, 3).map((s) => (
            <Card
              key={s.id}
              className={`border ${RANK_ROW_BG(s.computed.rank ?? 99)}`}
            >
              <CardContent className="p-4 text-center space-y-2">
                <div className="flex justify-center">
                  {RANK_ICON(s.computed.rank ?? 99)}
                </div>
                <div
                  className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-lg font-black ${
                    GRADE_BG[s.computed.grade] ?? "bg-gray-200"
                  }`}
                >
                  {s.computed.grade}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-500">Roll {s.rollNumber}</p>
                </div>
                <p className="text-lg font-black text-gray-900">
                  {s.computed.percentage.toFixed(2)}%
                </p>
                <Badge variant="success" className="text-xs">
                  Rank #{s.computed.rank}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full merit list table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">
                Rank
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-14">
                Roll
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Student Name
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Percentage
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Grade
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Division
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {passers.map((student, idx) => {
              const rank = student.computed.rank ?? idx + 1;
              const isTie =
                passers.filter((s) => s.computed.rank === rank).length > 1;

              return (
                <tr
                  key={student.id}
                  className={`${RANK_ROW_BG(rank)} border-b transition-colors`}
                >
                  {/* Rank */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {RANK_ICON(rank)}
                      <span
                        className={`font-black text-base ${
                          rank === 1
                            ? "text-yellow-600"
                            : rank === 2
                              ? "text-gray-500"
                              : rank === 3
                                ? "text-amber-700"
                                : "text-gray-700"
                        }`}
                      >
                        #{rank}
                      </span>
                      {isTie && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          tie
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Roll */}
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {student.rollNumber}
                  </td>

                  {/* Name */}
                  <td className="px-3 py-3">
                    <p className="font-semibold text-gray-900">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student.fatherName} · {student.category}
                    </p>
                  </td>

                  {/* Total */}
                  <td className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">
                    {student.computed.grandTotal}
                    <span className="text-xs font-normal text-gray-400">
                      /{student.computed.maxMarks}
                    </span>
                  </td>

                  {/* Percentage */}
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <span className="text-base font-black text-gray-900">
                      {student.computed.percentage.toFixed(2)}%
                    </span>
                  </td>

                  {/* Grade */}
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-black ${
                        GRADE_BG[student.computed.grade] ??
                        "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {student.computed.grade}
                    </span>
                  </td>

                  {/* Division */}
                  <td className="px-3 py-3 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {student.computed.division}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Non-passers summary */}
      {nonPassers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Not in Merit List
          </p>
          <div className="flex flex-wrap gap-2">
            {nonPassers.map((s) => (
              <span
                key={s.id}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  s.computed.result === "SUPPLEMENTARY"
                    ? "bg-amber-100 text-amber-800"
                    : s.computed.result === "ABSENT"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-red-100 text-red-800"
                }`}
              >
                Roll {s.rollNumber} — {s.name}
                <span className="opacity-60">
                  (
                  {s.computed.result === "SUPPLEMENTARY"
                    ? "Suppl."
                    : s.computed.result === "ABSENT"
                      ? "Absent"
                      : "Fail"}
                  )
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
