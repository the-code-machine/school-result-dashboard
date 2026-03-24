"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStudentsStore } from "@/store/students";
import { useSettingsStore } from "@/store/settings";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { SUBJECT_BY_CODE } from "@/lib/defaults";
import { assignRanks } from "@/lib/compute";
import type { Student, StudentComputed } from "@/types";
import React from "react";

// Helper to calculate subject grade based on MPBSE standard
function getSubjectGrade(percent: number) {
  if (percent >= 85) return "A+";
  if (percent >= 75) return "A";
  if (percent >= 60) return "B";
  if (percent >= 45) return "C";
  if (percent >= 33) return "D";
  if (percent >= 20) return "E1";
  return "E2";
}

export default function ClassRegisterPrintPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { getBySession } = useStudentsStore();
  const { school, sessions, classConfigs } = useSettingsStore();

  const session = sessions.find((s) => s.id === sessionId);
  const classCfg = session ? classConfigs[session.classId] : null;

  const students = useMemo(() => {
    const raw = getBySession(sessionId).filter(
      (s) => s.computed,
    ) as (Student & { computed: StudentComputed })[];
    const ranked = assignRanks(raw);
    return ranked.sort((a, b) =>
      a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }),
    );
  }, [getBySession, sessionId]);

  if (!session || !classCfg || students.length === 0) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-red-600 font-semibold">
          Error: No computed students found for this session.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  // CSS for this specific massive table
  const tableStyles = `
    .reg-table th, .reg-table td {
      border: 1px solid #000;
      padding: 2px 4px; /* Slightly more padding for readability */
      font-size: 7px;
      text-align: center;
      vertical-align: middle;
      white-space: nowrap;
    }
    .reg-table th { font-weight: bold; }
    .bg-teal-header { background-color: #00B0F0 !important; color: black; }
    .bg-orange-header { background-color: #FFC000 !important; color: black; }
    .bg-purple-header { background-color: #D9E1F2 !important; color: black; }
    .text-red { color: #FF0000 !important; font-weight: bold; }
    .text-blue { color: #0070C0 !important; font-weight: bold; }
    .text-purple { color: #7030A0 !important; font-weight: bold; }
  `;

  return (
    <div className="min-h-screen bg-gray-200 p-2 md:p-4 text-black font-sans">
      <style>{tableStyles}</style>

      {/* Action bar */}
      <div className="max-w-[297mm] mx-auto mb-4 flex justify-between items-center no-print bg-white p-3 rounded-xl shadow-sm border border-gray-200">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="bg-white text-black"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="text-sm font-bold text-gray-600 px-4 text-center">
          Scale down in print settings (e.g. 35-40%) to fit on a single
          landscape page.
        </div>
        <Button
          onClick={() => window.print()}
          className="gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </Button>
      </div>

      {/* PRINT SHEET WRAPPER - ✨ FIX: overflow-x-auto for screen, overflow-visible for print */}
      <div className="w-full max-w-full overflow-x-auto bg-white shadow-lg relative mx-auto print:overflow-visible print:shadow-none">
        {/* Inner wrapper forces the table to take its natural wide width */}
        <div className="min-w-max" style={{ padding: "10mm" }}>
          {/* HEADER */}
          <div className="text-center mb-4 border-b-2 border-black pb-2">
            <h1 className="text-sm font-black uppercase">
              SCHOOL NAME - {school.name}, DISTRICT - {school.district}, BLOCK -{" "}
              {school.block}, DISE CODE - {school.diseCode}
            </h1>
            <h2 className="text-lg font-black mt-1 text-blue-800">
              वार्षिक परीक्षाफल पत्रक, कक्षा-{session.classId}वीं, सत्र{" "}
              {session.year}
            </h2>
          </div>

          <table className="reg-table w-full border-collapse">
            <thead>
              {/* ROW 1: Group Headers */}
              <tr>
                <th
                  colSpan={14}
                  rowSpan={2}
                  className="bg-orange-header text-[8px]"
                >
                  विद्यार्थी जानकारी
                  <br />
                  Student Details
                </th>
                <th colSpan={6} className="bg-purple-header text-[8px]">
                  विषय कोड लिखें
                  <br />
                  Subject Codes
                </th>
                <th colSpan={12} className="bg-purple-header text-[8px]">
                  त्रैमासिक परीक्षा के प्राप्तांक
                  <br />
                  Quarterly Marks
                </th>
                <th colSpan={12} className="bg-purple-header text-[8px]">
                  अर्द्धवार्षिक परीक्षा के प्राप्तांक
                  <br />
                  Half-Yearly Marks
                </th>
                <th colSpan={12} className="bg-purple-header text-[8px]">
                  वार्षिक परीक्षा के प्राप्तांक
                  <br />
                  Annual Marks
                </th>
                <th rowSpan={3}>
                  Raw
                  <br />
                  Total
                </th>
                <th colSpan={10}>5% त्रैमासिक</th>
                <th colSpan={10}>5% अर्द्धवार्षिक</th>
                <th colSpan={10}>90% वार्षिक</th>
                <th colSpan={12}>वार्षिक मूल्यांकन - अधिभार का योग</th>
                <th rowSpan={3} className="bg-teal-header">
                  Grand
                  <br />
                  Total
                </th>
                <th rowSpan={3} className="bg-teal-header">
                  %
                </th>
                <th rowSpan={3} className="bg-teal-header">
                  Result
                  <br />
                  Grade
                </th>
                <th colSpan={7} className="bg-teal-header">
                  Subject Wise Grading
                </th>
                <th rowSpan={3}>Result</th>
                <th rowSpan={3}>Division</th>
                <th rowSpan={3}>Rank</th>
              </tr>

              {/* ROW 2: Subject Labels */}
              <tr>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={`c${i}`} className="text-purple">
                    Sub {i}
                  </th>
                ))}
                {/* TH/PR pairs for Q, HY, Ann */}
                {[...Array(3)].map((_, groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <th
                        key={`thpr${groupIdx}${i}`}
                        colSpan={2}
                        className="text-purple"
                      >
                        Sub {i}
                      </th>
                    ))}
                  </React.Fragment>
                ))}
                {/* 5%, 5%, 90% (only top 5 subjects calculated for these weights traditionally) */}
                {[...Array(3)].map((_, groupIdx) => (
                  <React.Fragment key={`w${groupIdx}`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <th key={`wthpr${groupIdx}${i}`} colSpan={2}>
                        S{i}
                      </th>
                    ))}
                  </React.Fragment>
                ))}
                {/* Final weighted TH/PR */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={`fw${i}`} colSpan={2}>
                    S{i}
                  </th>
                ))}
                {/* SWG */}
                {[1, 2, 3, 4, 5, "Env", "Add"].map((s) => (
                  <th key={`swg${s}`}>{s}</th>
                ))}
              </tr>

              {/* ROW 3: TH/PR Labels */}
              <tr>
                <th>S.N.</th>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Father Name</th>
                <th>Mother Name</th>
                <th>Cat</th>
                <th>Gen</th>
                <th>DOB</th>
                <th>Scholar</th>
                <th>SSSMID</th>
                <th>Enrol</th>
                <th>Med</th>
                <th>Sec</th>
                <th>CWSN</th>
                {[...Array(6)].map((_, i) => (
                  <th key={`sc${i}`}>Code</th>
                ))}

                {/* TH/PR repeating... */}
                {[...Array(18)].map((_, i) => (
                  <React.Fragment key={`marks${i}`}>
                    <th>TH</th>
                    <th>PR</th>
                  </React.Fragment>
                ))}
                {/* Weights repeating... */}
                {[...Array(15)].map((_, i) => (
                  <React.Fragment key={`weights${i}`}>
                    <th>TH</th>
                    <th>PR</th>
                  </React.Fragment>
                ))}
                {/* Final weights repeating... */}
                {[...Array(6)].map((_, i) => (
                  <React.Fragment key={`fw_thpr${i}`}>
                    <th>TH</th>
                    <th>PR</th>
                  </React.Fragment>
                ))}
                {[...Array(7)].map((_, i) => (
                  <th key={`swg_h${i}`}>Gr</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {students.map((s, idx) => {
                // Extract basic info
                const b = [
                  idx + 1,
                  s.rollNumber,
                  s.name,
                  s.fatherName,
                  s.motherName || "",
                  s.category,
                  s.gender,
                  s.dob ? new Date(s.dob).toLocaleDateString("en-GB") : "",
                  s.scholarNumber || "",
                  s.sssmid || "",
                  s.enrolmentNumber || "",
                  s.medium,
                  s.section || "",
                  "",
                ];

                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    {/* Demographics */}
                    {b.map((val, i) => (
                      <td
                        key={i}
                        className={
                          i === 1 ? "text-red" : i === 2 ? "text-left px-1" : ""
                        }
                      >
                        {val}
                      </td>
                    ))}
                    {/* Subject Codes */}
                    {[1, 2, 3, 4, 5, 6].map((slot) => {
                      const m = s.marks.find((x) => x.slot === slot);
                      return (
                        <td key={`code${slot}`} className="text-purple">
                          {m?.subjectCode || ""}
                        </td>
                      );
                    })}
                    {/* Quarterly */}
                    {[1, 2, 3, 4, 5, 6].map((slot) => {
                      const m = s.marks.find((x) => x.slot === slot);
                      return (
                        <React.Fragment key={`q${slot}`}>
                          <td>
                            {m?.quarterly?.isAbsent
                              ? "ABS"
                              : (m?.quarterly?.th ?? "")}
                          </td>
                          <td>
                            {m?.quarterly?.isAbsent
                              ? "ABS"
                              : (m?.quarterly?.pr ?? "")}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    {/* Half-Yearly */}
                    {[1, 2, 3, 4, 5, 6].map((slot) => {
                      const m = s.marks.find((x) => x.slot === slot);
                      return (
                        <React.Fragment key={`hy${slot}`}>
                          <td>
                            {m?.halfYearly?.isAbsent
                              ? "ABS"
                              : (m?.halfYearly?.th ?? "")}
                          </td>
                          <td>
                            {m?.halfYearly?.isAbsent
                              ? "ABS"
                              : (m?.halfYearly?.pr ?? "")}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    {/* Annual */}
                    {[1, 2, 3, 4, 5, 6].map((slot) => {
                      const m = s.marks.find((x) => x.slot === slot);
                      return (
                        <React.Fragment key={`an${slot}`}>
                          <td className="font-bold">
                            {m?.annual?.isAbsent
                              ? "ABS"
                              : (m?.annual?.th ?? "")}
                          </td>
                          <td className="font-bold">
                            {m?.annual?.isAbsent
                              ? "ABS"
                              : (m?.annual?.pr ?? "")}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    {/* Raw Total */}
                    <td className="text-red">
                      {s.marks.reduce(
                        (sum, m) =>
                          sum +
                          (m.quarterly?.th || 0) +
                          (m.quarterly?.pr || 0) +
                          (m.halfYearly?.th || 0) +
                          (m.halfYearly?.pr || 0) +
                          (m.annual?.th || 0) +
                          (m.annual?.pr || 0),
                        0,
                      )}
                    </td>
                    {/* 5% Quarterly (Top 5 subjects typically) */}
                    {[1, 2, 3, 4, 5].map((slot) => {
                      const m = s.marks.find((x) => x.slot === slot);
                      return (
                        <React.Fragment key={`p5q${slot}`}>
                          <td>
                            {m?.quarterly?.th
                              ? (m.quarterly.th * 0.05).toFixed(1)
                              : ""}
                          </td>
                          <td>
                            {m?.quarterly?.pr
                              ? (m.quarterly.pr * 0.05).toFixed(1)
                              : ""}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    {/* 5% Half-Yearly */}
                    {[1, 2, 3, 4, 5].map((slot) => {
                      const m = s.marks.find((x) => x.slot === slot);
                      return (
                        <React.Fragment key={`p5hy${slot}`}>
                          <td>
                            {m?.halfYearly?.th
                              ? (m.halfYearly.th * 0.05).toFixed(1)
                              : ""}
                          </td>
                          <td>
                            {m?.halfYearly?.pr
                              ? (m.halfYearly.pr * 0.05).toFixed(1)
                              : ""}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    {/* 90% Annual */}
                    {[1, 2, 3, 4, 5].map((slot) => {
                      const m = s.marks.find((x) => x.slot === slot);
                      return (
                        <React.Fragment key={`p90an${slot}`}>
                          <td>
                            {m?.annual?.th
                              ? (m.annual.th * 0.9).toFixed(1)
                              : ""}
                          </td>
                          <td>
                            {m?.annual?.pr
                              ? (m.annual.pr * 0.9).toFixed(1)
                              : ""}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    {/* Final Weighted Combined Totals */}
                    {[1, 2, 3, 4, 5, 6].map((slot) => {
                      const m = s.marks.find((x) => x.slot === slot);
                      if (!m)
                        return (
                          <React.Fragment key={`wt${slot}`}>
                            <td></td>
                            <td></td>
                          </React.Fragment>
                        );

                      const qTh = m.quarterly?.th || 0;
                      const qPr = m.quarterly?.pr || 0;
                      const hyTh = m.halfYearly?.th || 0;
                      const hyPr = m.halfYearly?.pr || 0;
                      const anTh = m.annual?.th || 0;
                      const anPr = m.annual?.pr || 0;

                      // If slot 6 (additional), standard rules usually apply raw or distinct logic, falling back to basic sum here
                      const wtTh =
                        slot === 6
                          ? anTh
                          : Math.round(qTh * 0.05 + hyTh * 0.05 + anTh * 0.9);
                      const wtPr =
                        slot === 6
                          ? anPr
                          : Math.round(qPr * 0.05 + hyPr * 0.05 + anPr * 0.9);

                      return (
                        <React.Fragment key={`wt${slot}`}>
                          <td className="text-blue">{wtTh || ""}</td>
                          <td className="text-blue">{wtPr || ""}</td>
                        </React.Fragment>
                      );
                    })}
                    {/* Grand Totals and Results */}
                    <td className="text-red text-[10px]">
                      {s.computed?.grandTotal}
                    </td>
                    <td className="font-bold text-[10px]">
                      {s.computed?.percentage.toFixed(1)}
                    </td>
                    <td className="text-blue text-[10px]">
                      {s.computed?.grade}
                    </td>
                    {/* Subject Wise Grades (Columns 103-109) */}
                    {[1, 2, 3, 4, 5].map((slot) => {
                      const t = s.computed?.subjectTotals.find(
                        (x) => x.slot === slot,
                      );
                      const rule = s.marks.find((x) => x.slot === slot)
                        ? SUBJECT_BY_CODE[
                            s.marks.find((x) => x.slot === slot)!.subjectCode
                          ]
                        : null;
                      const max = (rule?.thMax || 0) + (rule?.prMax || 0);
                      const percent = t && max > 0 ? (t.total / max) * 100 : 0;
                      return (
                        <td key={`swg${slot}`} className="text-red">
                          {t ? getSubjectGrade(percent) : ""}
                        </td>
                      );
                    })}
                    <td className="text-red">{s.computed?.grade}</td>{" "}
                    {/* Env grade usually mimics final */}
                    <td className="text-red"></td> {/* Addl sub grade */}
                    {/* Final Meta */}
                    <td className="font-bold">{s.computed?.result}</td>
                    <td>
                      {s.computed?.division === "Distinction" ||
                      s.computed?.division === "First"
                        ? "I"
                        : s.computed?.division === "Second"
                          ? "II"
                          : s.computed?.division === "Third"
                            ? "III"
                            : "—"}
                    </td>
                    <td className="font-bold">{s.computed?.rank}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
