"use client";

import { useState, useMemo } from "react";
import type {
  Student,
  StudentComputed,
  SubjectRule,
  ClassConfig,
} from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortField = "roll" | "name" | "total" | "pct" | "rank";
type SortDir = "asc" | "desc";

const RESULT_STYLE: Record<string, string> = {
  PASS: "bg-emerald-100 text-emerald-800",
  FAIL: "bg-red-100 text-red-800",
  SUPPLEMENTARY: "bg-amber-100 text-amber-800",
  ABSENT: "bg-gray-100 text-gray-600",
  PENDING: "bg-blue-50 text-blue-600",
};

const RESULT_LABEL: Record<string, string> = {
  PASS: "Pass",
  FAIL: "Fail",
  SUPPLEMENTARY: "Suppl.",
  ABSENT: "Absent",
  PENDING: "Pending",
};

const GRADE_COLOR: Record<string, string> = {
  "A+": "text-emerald-700 font-black",
  A: "text-green-700 font-bold",
  B: "text-blue-700 font-bold",
  C: "text-cyan-700 font-semibold",
  D: "text-amber-700 font-semibold",
  E1: "text-orange-600",
  E2: "text-red-600",
};

interface Props {
  students: (Student & { computed: StudentComputed })[];
  subjects: SubjectRule[];
  classCfg: ClassConfig | null;
}

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) {
  if (field !== sortField) {
    return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-300" />;
  }
  return sortDir === "asc" ? (
    <ArrowUp className="w-3 h-3 ml-1 text-blue-600" />
  ) : (
    <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />
  );
}

export function ResultTable({ students, subjects, classCfg }: Props) {
  const [search, setSearch] = useState("");
  const [filterRes, setFilterRes] = useState("all");
  const [sortField, setSortField] = useState<SortField>("roll");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.code, s]));

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    return students
      .filter((s) => {
        const q = search.toLowerCase();
        return (
          !q || s.name.toLowerCase().includes(q) || s.rollNumber.includes(q)
        );
      })
      .filter((s) =>
        filterRes === "all" ? true : s.computed.result === filterRes,
      )
      .sort((a, b) => {
        let diff = 0;
        if (sortField === "roll") {
          diff = a.rollNumber.localeCompare(b.rollNumber, undefined, {
            numeric: true,
          });
        } else if (sortField === "name") {
          diff = a.name.localeCompare(b.name);
        } else if (sortField === "total") {
          diff = a.computed.grandTotal - b.computed.grandTotal;
        } else if (sortField === "pct") {
          diff = a.computed.percentage - b.computed.percentage;
        } else if (sortField === "rank") {
          diff = (a.computed.rank ?? 999) - (b.computed.rank ?? 999);
        }
        return sortDir === "asc" ? diff : -diff;
      });
  }, [students, search, filterRes, sortField, sortDir]);

  // unique subject slots across all students
  const allSlots = useMemo(() => {
    const slots = new Set<number>();
    students.forEach((s) => s.marks.forEach((m) => slots.add(m.slot)));
    return Array.from(slots).sort((a, b) => a - b);
  }, [students]);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search name or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterRes} onValueChange={setFilterRes}>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="PASS">Pass</SelectItem>
            <SelectItem value="FAIL">Fail</SelectItem>
            <SelectItem value="SUPPLEMENTARY">Suppl.</SelectItem>
            <SelectItem value="ABSENT">Absent</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">{filtered.length} students</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Sortable headers */}
              {[
                { field: "roll" as SortField, label: "Roll" },
                { field: "name" as SortField, label: "Name" },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 whitespace-nowrap"
                  onClick={() => toggleSort(field)}
                >
                  <span className="flex items-center">
                    {label}
                    <SortIcon
                      field={field}
                      sortField={sortField}
                      sortDir={sortDir}
                    />
                  </span>
                </th>
              ))}

              {/* Per-subject columns */}
              {allSlots.map((slot) => (
                <th
                  key={slot}
                  className="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  Sub {slot}
                </th>
              ))}

              {/* Summary columns */}
              {[
                { field: "total" as SortField, label: "Total" },
                { field: "pct" as SortField, label: "%" },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 whitespace-nowrap"
                  onClick={() => toggleSort(field)}
                >
                  <span className="flex items-center justify-center">
                    {label}
                    <SortIcon
                      field={field}
                      sortField={sortField}
                      sortDir={sortDir}
                    />
                  </span>
                </th>
              ))}

              <th className="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Grade
              </th>
              <th className="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Division
              </th>
              <th
                className="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort("rank")}
              >
                <span className="flex items-center justify-center">
                  Rank
                  <SortIcon
                    field="rank"
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </span>
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Result
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={allSlots.length + 8}
                  className="text-center text-gray-400 py-10 text-sm"
                >
                  No students match
                </td>
              </tr>
            )}
            {filtered.map((student, idx) => {
              const c = student.computed;
              return (
                <tr
                  key={student.id}
                  className={
                    idx % 2 === 0
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-50/50 hover:bg-gray-100/50"
                  }
                >
                  {/* Roll */}
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {student.rollNumber}
                  </td>

                  {/* Name */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-900">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student.fatherName}
                    </p>
                  </td>

                  {/* Per-slot marks */}
                  {allSlots.map((slot) => {
                    const subResult = c.subjectTotals.find(
                      (t) => t.slot === slot,
                    );
                    const mark = student.marks.find((m) => m.slot === slot);
                    const subjectName = mark
                      ? (subjectMap[mark.subjectCode]?.name ?? "—")
                      : "—";

                    return (
                      <td
                        key={slot}
                        className="px-2 py-2 text-center whitespace-nowrap"
                        title={subjectName}
                      >
                        {subResult ? (
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-sm font-semibold ${
                                subResult.isPassed
                                  ? "text-gray-800"
                                  : "text-red-600"
                              }`}
                            >
                              {subResult.total}
                            </span>
                            <span
                              className={`text-[10px] ${
                                GRADE_COLOR[subResult.grade] ?? "text-gray-500"
                              }`}
                            >
                              {subResult.grade}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Grand Total */}
                  <td className="px-3 py-2 text-center font-bold text-gray-900 whitespace-nowrap">
                    {c.grandTotal}
                    <span className="text-xs font-normal text-gray-400">
                      /{c.maxMarks}
                    </span>
                  </td>

                  {/* Percentage */}
                  <td className="px-3 py-2 text-center font-semibold text-gray-800 whitespace-nowrap">
                    {c.percentage.toFixed(1)}%
                  </td>

                  {/* Grade */}
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    <span
                      className={`text-sm ${GRADE_COLOR[c.grade] ?? "text-gray-600"}`}
                    >
                      {c.grade}
                    </span>
                  </td>

                  {/* Division */}
                  <td className="px-2 py-2 text-center text-xs text-gray-600 whitespace-nowrap">
                    {c.division}
                  </td>

                  {/* Rank */}
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    {c.rank ? (
                      <span className="text-sm font-bold text-violet-700">
                        #{c.rank}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Result */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        RESULT_STYLE[c.result] ?? RESULT_STYLE.PENDING
                      }`}
                    >
                      {RESULT_LABEL[c.result] ?? c.result}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
