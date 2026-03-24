"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStudentsStore } from "@/store/students";
import { useSettingsStore } from "@/store/settings";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { SUBJECT_BY_CODE } from "@/lib/defaults";
import React from "react";

const THEMES = [
  { name: "Navy Blue", hex: "#0a2463" },
  { name: "Crimson Red", hex: "#8b0000" },
  { name: "Forest Green", hex: "#1b4d3e" },
  { name: "Classic Black", hex: "#000000" },
];

function themeVars(hex: string) {
  return {
    "--theme": hex,
    "--theme-light": hex + "18",
    "--theme-mid": hex,
  } as React.CSSProperties;
}

function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (num === 0) return "Zero";
  if (num < 20) return ones[num];
  if (num < 100)
    return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000)
    return (
      ones[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " " + numberToWords(num % 100) : "")
    );
  return num.toString();
}

const TB = "1.5px solid var(--theme)";
const TB2 = "2px solid var(--theme)";

export default function MarksheetPrintPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [themeColor, setThemeColor] = useState(THEMES[0].hex);

  const { getById } = useStudentsStore();
  const { school, sessions, classConfigs } = useSettingsStore();

  const student = getById(studentId);
  const session = sessions.find((s) => s.id === student?.sessionId);
  const classCfg = session ? classConfigs[session.classId] : null;

  if (!student || !session || !classCfg || !student.computed) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-red-600 font-semibold">
          Error: Student data or computed results not found.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const { computed } = student;

  let droppedSubjectSlot = -1;
  if (classCfg.bestOfCount < classCfg.totalSubjects) {
    const passed = computed.subjectTotals.filter((s) => s.isPassed);
    if (passed.length > classCfg.bestOfCount) {
      droppedSubjectSlot = [...passed].sort((a, b) => a.total - b.total)[0]
        .slot;
    } else if (computed.subjectTotals.length > classCfg.bestOfCount) {
      const failed = computed.subjectTotals.filter((s) => !s.isPassed);
      if (failed.length > 0) droppedSubjectSlot = failed[0].slot;
    }
  }

  const tv = themeVars(themeColor);

  const globalStyles = `
    @media print {
      .no-print { display: none !important; }
      body { background: #fff !important; }
      .a4-sheet {
        box-shadow: none !important;
        page-break-after: always;
        width: 210mm !important;
        height: 297mm !important;
        min-height: unset !important;
        margin: 0 !important;
      }
    }
    .a4-sheet {
      font-family: 'Times New Roman', Times, serif;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .marks-tbl, .marks-tbl th, .marks-tbl td,
    .info-tbl,  .info-tbl  th, .info-tbl  td,
    .result-tbl,.result-tbl th,.result-tbl td,
    .grade-tbl, .grade-tbl th, .grade-tbl td { border-color: var(--theme) !important; }
    .th-bg  { background: var(--theme)  !important; color: #fff !important; }
    .th-lbg { background: var(--theme-light) !important; }
    .best5-row { background: var(--theme-light) !important; }
    .words-row  { background: var(--theme-light) !important; }
    .edu-title  { background: var(--theme) !important; color: #fff !important; }
  `;

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8" style={tv}>
      <style>{globalStyles}</style>

      {/* Action bar */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center no-print bg-white p-3 rounded-xl shadow-sm border border-gray-200">
        <Button
          variant="outline"
          onClick={() => router.push(`/sessions/${session.id}`)}
          className="bg-white text-black"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500 mr-2">
            Theme Color:
          </span>
          {THEMES.map((t) => (
            <button
              key={t.hex}
              onClick={() => setThemeColor(t.hex)}
              className={`w-6 h-6 rounded-full border-2 ${themeColor === t.hex ? "border-gray-900 scale-110" : "border-transparent"}`}
              style={{ backgroundColor: t.hex }}
              title={t.name}
            />
          ))}
        </div>
        <Button onClick={() => window.print()} className="gap-2 shadow-md">
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>

      {/* PAGE 1 – FRONT */}
      <div
        className="a4-sheet w-full max-w-[210mm] mx-auto bg-white shadow-lg relative mb-8"
        style={{ height: "297mm", overflow: "hidden" }}
      >
        <div
          className="absolute inset-[6mm] pointer-events-none"
          style={{ border: `3px solid var(--theme)`, zIndex: 0 }}
        />

        <div
          className="relative flex flex-col"
          style={{ height: "100%", padding: "8mm 9mm", zIndex: 1 }}
        >
          {/* HEADER */}
          <div
            className="flex items-center gap-2 pb-[5px] mb-[5px]"
            style={{ borderBottom: TB2 }}
          >
            <div
              className="shrink-0 flex items-center justify-center"
              style={{ width: 22, height: 22 }}
            >
              <img
                src={school.logoUrl || "/logo.png"}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="flex-1 text-center">
              <div
                style={{
                  fontSize: "13pt",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  color: "var(--theme)",
                  lineHeight: 1.2,
                }}
              >
                {school.name}
              </div>
              <div
                style={{
                  fontSize: "7.5pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "var(--theme)",
                  marginTop: 2,
                }}
              >
                DISTRICT – {school.district} ({school.state})
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontSize: "8pt",
                  fontWeight: "bold",
                  color: "var(--theme)",
                }}
              >
                <div>अंकसूची</div>
                <div>MARKSHEET</div>
              </div>
            </div>

            {/* Photo box: Fixed to leave blank space if no photo url */}
            <div
              className="shrink-0 flex items-center justify-center overflow-hidden"
              style={{ width: "24mm", height: "32mm" }}
            >
              {/* Note: if you ever add student.photoUrl to the schema, render the <img src={student.photoUrl}/> here */}
            </div>
          </div>

          <div
            className="flex justify-between"
            style={{
              fontSize: "7.5pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              padding: "2px 4px",
              marginBottom: 4,
              color: "var(--theme)",
              borderBottom: `1.5px solid var(--theme)`,
            }}
          >
            <span>
              CLASS – {session.classId}th {session.section}
            </span>
            <span>SESSION – {session.year}</span>
            <span>DISE CODE – {school.diseCode}</span>
          </div>

          <table
            className="info-tbl w-full text-center mb-[4px]"
            style={{
              borderCollapse: "collapse",
              border: TB2,
              fontSize: "6.5pt",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            <thead>
              <tr>
                {[
                  ["स. क्र.", "S. NO."],
                  ["अनुक्रमांक", "ROLL NO."],
                  ["नामांकन क्रमांक", "ENROLMENT NO."],
                  ["समग्र आई डी", "SSSMID"],
                  ["प्रवेश क्रमांक", "SCHOLAR NO."],
                  ["संस्था क्रमांक", "SCHOOL CODE"],
                  ["माध्यम", "MEDIUM"],
                ].map(([h, e], i, arr) => (
                  <th
                    key={h}
                    className="th-bg"
                    style={{
                      border: TB,
                      padding: "2px 3px",
                      borderRight: i < arr.length - 1 ? TB : undefined,
                    }}
                  >
                    {h}
                    <br />
                    {e}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  "1",
                  student.rollNumber,
                  student.enrolmentNumber || "—",
                  student.sssmid || "—",
                  student.scholarNumber || "—",
                  school.mpbseCode,
                  student.medium,
                ].map((v, i, arr) => (
                  <td
                    key={i}
                    style={{
                      border: TB,
                      padding: "3px 3px",
                      borderRight: i < arr.length - 1 ? TB : undefined,
                      fontSize: "7.5pt",
                    }}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "3px 8px",
              fontSize: "7.5pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              marginBottom: 5,
              padding: "0 2px",
            }}
          >
            {[
              ["श्री/श्रीमती/कुमारी SHRI/SMT/KUMARI –", student.name],
              ["पिता का नाम श्री FATHER'S NAME SHRI –", student.fatherName],
              [
                "माता का नाम श्रीमती MOTHER'S NAME SMT. –",
                student.motherName || "—",
              ],
              [
                "जन्म तिथि DATE OF BIRTH –",
                student.dob
                  ? new Date(student.dob).toLocaleDateString("en-GB")
                  : "—",
              ],
            ].map(([label, value]) => (
              <React.Fragment key={label}>
                <div style={{ whiteSpace: "nowrap", color: "var(--theme)" }}>
                  {label}
                </div>
                <div
                  style={{
                    borderBottom: `1.5px solid var(--theme)`,
                    paddingBottom: 1,
                    fontSize: "8pt",
                  }}
                >
                  {value}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div
            className="edu-title"
            style={{
              border: TB2,
              borderBottom: "none",
              textAlign: "center",
              fontSize: "7.5pt",
              fontWeight: "bold",
              padding: "3px",
              textTransform: "uppercase",
            }}
          >
            EDUCATIONAL PERFORMANCE
          </div>

          <table
            className="marks-tbl w-full text-center"
            style={{
              borderCollapse: "collapse",
              border: TB2,
              fontSize: "6pt",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            <thead>
              <tr style={{ borderBottom: TB }}>
                <th
                  rowSpan={3}
                  style={{ border: TB, padding: "2px 3px", width: 132 }}
                >
                  विषय
                  <br />
                  SUBJECT
                </th>
                <th colSpan={2} style={{ border: TB, padding: "2px" }}>
                  अधिकतम अंक
                  <br />
                  MAXIMUM MARKS
                </th>
                <th colSpan={2} style={{ border: TB, padding: "2px" }}>
                  न्यूनतम अंक
                  <br />
                  MINIMUM MARKS
                </th>
                <th
                  rowSpan={2}
                  style={{ border: TB, padding: "2px", width: 46 }}
                >
                  वार्षिक परीक्षा प्राप्तांक सैद्धांतिक
                  <br />
                  ANNUAL OBTAINED MARKS THEORY
                </th>
                <th colSpan={3} style={{ border: TB, padding: "2px" }}>
                  प्रायोगिक/प्रोजेक्ट
                  <br />
                  PRACTICAL/PROJECT
                </th>
                <th colSpan={2} style={{ border: TB, padding: "2px" }}>
                  TOTAL
                  <br />
                  (IN ROUND)
                </th>
                <th
                  rowSpan={3}
                  style={{ border: TB, padding: "2px", width: 38 }}
                >
                  GRAND TOTAL
                </th>
                <th
                  rowSpan={3}
                  style={{ border: TB, padding: "2px", width: 40 }}
                >
                  REMARK
                </th>
              </tr>
              <tr style={{ borderBottom: TB }}>
                {["TH", "PR", "TH", "PR"].map((h, i) => (
                  <th
                    key={i}
                    rowSpan={2}
                    style={{ border: TB, padding: "2px", width: 22 }}
                  >
                    {h}
                  </th>
                ))}
                <th style={{ border: TB, padding: "2px", width: 46 }}>
                  वार्षिक परीक्षा प्राप्तांक प्रायोगिक/प्रोजेक्ट
                  <br />
                  ANNUAL OBTAINED MARKS PRACTICAL/PROJECT
                </th>
                <th style={{ border: TB, padding: "2px", width: 44 }}>
                  त्रैमासिक परीक्षा का 5% अधिभार
                  <br />
                  (TH+PR) 5% WEIGHTAGE OF QUARTERLY EXAM
                </th>
                <th style={{ border: TB, padding: "2px", width: 44 }}>
                  अर्द्धवार्षिक परीक्षा का 5% अधिभार
                  <br />
                  (TH+PR) 5% WEIGHTAGE OF HALF YEARLY EXAM
                </th>
                <th
                  rowSpan={2}
                  style={{ border: TB, padding: "2px", width: 28 }}
                >
                  TH
                </th>
                <th
                  rowSpan={2}
                  style={{ border: TB, padding: "2px", width: 28 }}
                >
                  PR
                </th>
              </tr>
              <tr style={{ borderBottom: TB2 }}>
                <th style={{ border: TB, padding: "1px" }}>(I)</th>
                <th style={{ border: TB, padding: "1px" }}>(II)</th>
                <th style={{ border: TB, padding: "1px" }}>(III)</th>
                <th style={{ border: TB, padding: "1px" }}>(I+II+III)</th>
              </tr>
            </thead>
            <tbody>
              {computed.subjectTotals.map((sub) => {
                const markEntry = student.marks.find(
                  (m) => m.slot === sub.slot,
                );
                const rule = markEntry
                  ? SUBJECT_BY_CODE[markEntry.subjectCode]
                  : null;

                const qTotal =
                  (markEntry?.quarterly?.th || 0) +
                  (markEntry?.quarterly?.pr || 0);
                const hyTotal =
                  (markEntry?.halfYearly?.th || 0) +
                  (markEntry?.halfYearly?.pr || 0);
                const qWeight =
                  qTotal > 0 ? (qTotal * 0.05).toFixed(2) : "0.00";
                const hyWeight =
                  hyTotal > 0 ? (hyTotal * 0.05).toFixed(2) : "0.00";

                const anTh = markEntry?.annual?.isAbsent
                  ? "ABS"
                  : (markEntry?.annual?.th ?? "—");
                const anPr = markEntry?.annual?.isAbsent
                  ? "ABS"
                  : (markEntry?.annual?.pr ?? "—");

                const isDropped = droppedSubjectSlot === sub.slot;
                const remark = sub.total >= 75 ? "DISTN" : isDropped ? "#" : "";
                const thTotal =
                  anTh === "ABS"
                    ? "ABS"
                    : Math.round(
                        Number(anTh) + Number(qWeight) + Number(hyWeight),
                      );

                return (
                  <tr key={sub.slot} style={{ borderBottom: TB, height: 22 }}>
                    <td
                      style={{
                        border: TB,
                        padding: "1px 4px",
                        textAlign: "left",
                        fontSize: "6.5pt",
                      }}
                    >
                      ({rule?.code}) {rule?.name}
                    </td>
                    <td
                      style={{ border: TB, padding: "1px", color: "#c0392b" }}
                    >
                      {rule?.thMax ?? "—"}
                    </td>
                    <td
                      style={{ border: TB, padding: "1px", color: "#c0392b" }}
                    >
                      {rule?.prMax ?? "—"}
                    </td>
                    <td
                      style={{ border: TB, padding: "1px", color: "#6c3483" }}
                    >
                      {rule?.thPass ?? "—"}
                    </td>
                    <td
                      style={{ border: TB, padding: "1px", color: "#6c3483" }}
                    >
                      {rule?.prPass ?? "—"}
                    </td>
                    <td style={{ border: TB, padding: "1px", fontSize: "7pt" }}>
                      {anTh}
                    </td>
                    <td style={{ border: TB, padding: "1px" }}>{anPr}</td>
                    <td style={{ border: TB, padding: "1px" }}>{qWeight}</td>
                    <td style={{ border: TB, padding: "1px" }}>{hyWeight}</td>
                    <td style={{ border: TB, padding: "1px", fontSize: "7pt" }}>
                      {thTotal}
                    </td>
                    <td style={{ border: TB, padding: "1px", fontSize: "7pt" }}>
                      {anPr}
                    </td>
                    <td style={{ border: TB, padding: "1px", fontSize: "7pt" }}>
                      {sub.total}
                    </td>
                    <td style={{ border: TB, padding: "1px", fontSize: "7pt" }}>
                      {remark}
                    </td>
                  </tr>
                );
              })}

              {Array.from({
                length: Math.max(0, 6 - computed.subjectTotals.length),
              }).map((_, i) => (
                <tr key={`pad-${i}`} style={{ borderBottom: TB, height: 22 }}>
                  <td colSpan={13} style={{ border: TB }} />
                </tr>
              ))}

              <tr className="th-lbg" style={{ borderBottom: TB2, height: 22 }}>
                <td
                  style={{
                    border: TB,
                    padding: "1px 6px",
                    textAlign: "right",
                    fontSize: "7pt",
                  }}
                >
                  TOTAL
                </td>
                <td
                  style={{
                    border: TB,
                    padding: "1px",
                    color: "#c0392b",
                    fontSize: "7pt",
                  }}
                >
                  {computed.subjectTotals.reduce(
                    (sum, s) =>
                      sum +
                      (SUBJECT_BY_CODE[
                        student.marks.find((m) => m.slot === s.slot)
                          ?.subjectCode || 0
                      ]?.thMax || 0),
                    0,
                  )}
                </td>
                <td
                  style={{
                    border: TB,
                    padding: "1px",
                    color: "#c0392b",
                    fontSize: "7pt",
                  }}
                >
                  {computed.subjectTotals.reduce(
                    (sum, s) =>
                      sum +
                      (SUBJECT_BY_CODE[
                        student.marks.find((m) => m.slot === s.slot)
                          ?.subjectCode || 0
                      ]?.prMax || 0),
                    0,
                  )}
                </td>
                <td colSpan={6} style={{ border: TB }} />
                <td style={{ border: TB }} />
                <td style={{ border: TB }} />
                <td style={{ border: TB, padding: "1px", fontSize: "7pt" }}>
                  {computed.subjectTotals.reduce((sum, s) => sum + s.total, 0)}
                </td>
                <td style={{ border: TB }} />
              </tr>
            </tbody>
          </table>

          {classCfg.bestOfCount < classCfg.totalSubjects && (
            <div
              className="best5-row flex"
              style={{
                border: TB2,
                borderTop: "none",
                fontWeight: "bold",
                fontSize: "7.5pt",
              }}
            >
              <div style={{ width: 186, borderRight: TB2, padding: "3px 5px" }}>
                Total of Best Five Subjects
              </div>
              <div
                style={{
                  width: 62,
                  borderRight: TB2,
                  padding: "3px",
                  textAlign: "center",
                  color: "#c0392b",
                }}
              >
                {classCfg.totalMaxMarks}
              </div>
              <div style={{ flex: 1, borderRight: TB2 }} />
              <div
                style={{
                  width: 106,
                  padding: "3px",
                  textAlign: "center",
                  fontSize: "10pt",
                  color: "var(--theme)",
                }}
              >
                {computed.grandTotal}
              </div>
            </div>
          )}

          <table
            className="result-tbl w-full text-center"
            style={{
              borderCollapse: "collapse",
              border: TB2,
              fontSize: "6pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            <thead>
              <tr>
                {[
                  ["परीक्षा परिणाम", "EXAM RESULT"],
                  ["पूर्णांक", "MAX. MARKS"],
                  ["कुल प्राप्तांक", "TOTAL MARKS"],
                  ["प्रतिशत", "PERCENTAGE"],
                  ["ग्रेड", "GRADE"],
                  ["श्रेणी", "DIVISION"],
                  [
                    "पर्यावरण शिक्षा एवं आपदा प्रबंधन ग्रेड",
                    "ENVIRONMENTAL EDUCATION & DISASTER MANAGEMENT GRADE",
                  ],
                ].map(([h, e], i, arr) => (
                  <th
                    key={h}
                    className="th-bg"
                    style={{
                      border: TB,
                      padding: "2px 3px",
                      borderRight: i < arr.length - 1 ? TB : undefined,
                    }}
                  >
                    {h}
                    <br />
                    {e}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ fontSize: "9pt" }}>
                <td style={{ border: TB, padding: "3px" }}>
                  {computed.result}
                </td>
                <td style={{ border: TB, padding: "3px", color: "#c0392b" }}>
                  {computed.maxMarks}
                </td>
                <td style={{ border: TB, padding: "3px" }}>
                  {computed.grandTotal}
                </td>
                <td style={{ border: TB, padding: "3px" }}>
                  {computed.percentage.toFixed(2)}
                </td>
                <td style={{ border: TB, padding: "3px" }}>{computed.grade}</td>
                <td style={{ border: TB, padding: "3px" }}>
                  {computed.division === "Distinction" ||
                  computed.division === "First"
                    ? "I"
                    : computed.division === "Second"
                      ? "II"
                      : "III"}
                </td>
                <td style={{ border: TB, padding: "3px" }}>{computed.grade}</td>
              </tr>
            </tbody>
          </table>

          <div
            className="words-row flex gap-2"
            style={{
              border: TB2,
              borderTop: "none",
              padding: "3px 6px",
              fontSize: "7pt",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            <span>कुल प्राप्तांक शब्दों में (TOTAL MARKS IN WORDS) –</span>
            <span>{numberToWords(computed.grandTotal)}</span>
          </div>

          <div
            style={{
              marginTop: 3,
              fontSize: "6pt",
              fontWeight: "bold",
              padding: "0 2px",
              lineHeight: 1.4,
            }}
          >
            # से दर्शाया गया विषय कुल योग में शामिल नहीं है। परीक्षा परिणाम
            बेस्ट फाइव पद्धति के आधार पर तैयार किया गया है।
            <br />
            Shown subject is not included in the grand total. The result of the
            exam has been prepared on the basis of best five method.
          </div>

          <div
            className="mt-auto"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingTop: "10mm",
              paddingBottom: "5mm",
              paddingLeft: "4mm",
              paddingRight: "4mm",
            }}
          >
            {[
              [
                "38mm",
                "कक्षा शिक्षक के हस्ताक्षर",
                "Signature of Class Teacher",
              ],
              [
                "38mm",
                "परीक्षा प्रभारी के हस्ताक्षर",
                "Signature of Exam Incharge",
              ],
              [
                "50mm",
                "प्राचार्य के हस्ताक्षर एवं पदमुद्रा",
                "Seal and Signature of Principal",
              ],
            ].map(([w, hi, en]) => (
              <div
                key={hi}
                style={{
                  textAlign: "center",
                  fontSize: "6pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "var(--theme)",
                }}
              >
                <div
                  style={{
                    width: w,
                    borderBottom: `1.5px solid var(--theme)`,
                    margin: "0 auto 3px",
                  }}
                />
                {hi}
                <br />
                {en}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAGE 2 – BACK */}
      <div
        className="a4-sheet w-full max-w-[210mm] mx-auto bg-white shadow-lg relative"
        style={{ height: "297mm", overflow: "hidden" }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            inset: "8mm",
            border: `3px solid var(--theme)`,
            borderRadius: "12mm",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "14mm 16mm",
            fontSize: "8pt",
            fontWeight: "bold",
            lineHeight: 1.55,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: "11pt",
              fontWeight: "bold",
              color: "var(--theme)",
              marginBottom: 8,
            }}
          >
            वार्षिक परीक्षा कक्षा–{session.classId}वीं, {session.year}
          </div>

          <div
            style={{
              color: "var(--theme)",
              fontSize: "8.5pt",
              marginBottom: 4,
            }}
          >
            संकेत
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr",
              gap: "2px 6px",
              marginBottom: 10,
              fontSize: "7.8pt",
            }}
          >
            {[
              ["TH", "सैद्धांतिक भाग"],
              ["PR", "प्रायोगिक / प्रोजेक्ट / आंतरिक भाग"],
              [
                "DISTN",
                "75% या अधिक अंक मिलने के कारण संबंधित विषय में विशेष योग्यता दी गई है।",
              ],
              ["GRACE", "संबंधित विषय में कृपांक से उत्तीर्ण।"],
              [
                "GRTH",
                "संबंधित विषय के सैद्धांतिक भाग में कृपांक से उत्तीर्ण।",
              ],
              [
                "GRPR",
                "संबंधित विषय के प्रायोगिक / आंतरिक भाग में कृपांक से उत्तीर्ण।",
              ],
              ["SUPPL", "संबंधित विषय में पूरक की पात्रता है।"],
              [
                "SUPTH",
                "संबंधित विषय के सैद्धांतिक भाग में पूरक की पात्रता है।",
              ],
              [
                "SUPPR",
                "संबंधित विषय के प्रायोगिक / आंतरिक भाग में पूरक की पात्रता है।",
              ],
              ["FAIL", "संबंधित विषय में अनुत्तीर्ण।"],
              ["FLDTH", "संबंधित विषय के सैद्धांतिक भाग में अनुत्तीर्ण।"],
              [
                "FLDPR",
                "संबंधित विषय के प्रायोगिक / आंतरिक भाग में अनुत्तीर्ण।",
              ],
              [
                "FLDTP",
                "संबंधित विषय के सैद्धांतिक व प्रायोगिक / सैद्धांतिक व आंतरिक दोनों भागों में अनुत्तीर्ण।",
              ],
              ["ABS", "संबंधित विषय / प्रश्नपत्र में अनुपस्थित।"],
              ["*", "पूरक परीक्षा का विषय दर्शाता है।"],
              [
                "CAN",
                "परीक्षा में अनुचित साधन का उपयोग करने के कारण संबंधित विषय की परीक्षा निरस्त की गई है।",
              ],
            ].map(([key, val]) => (
              <React.Fragment key={key}>
                <div style={{ color: "var(--theme)", fontWeight: 900 }}>
                  {key}
                </div>
                <div>{val}</div>
              </React.Fragment>
            ))}
          </div>

          <div
            style={{
              color: "var(--theme)",
              fontSize: "8.5pt",
              marginBottom: 4,
            }}
          >
            नोट:–
          </div>
          <ol
            style={{
              paddingLeft: 16,
              fontSize: "7.8pt",
              lineHeight: 1.6,
              marginBottom: 10,
            }}
          >
            <li style={{ marginBottom: 3 }}>
              सभी विषयों की सैद्धांतिक व प्रायोगिक / आंतरिक परीक्षा में उत्तीर्ण
              होने के लिए अलग–अलग न्यूनतम 33% अंक प्राप्त करना अनिवार्य है।
            </li>
            <li style={{ marginBottom: 3 }}>
              सभी विषयों के अधिकतम अंकों के योग में 60% अथवा अधिक प्राप्तांक
              होने पर प्रथम श्रेणी, 45% अथवा अधिक किंतु 60% से कम प्राप्तांक
              होने पर द्वितीय श्रेणी तथा 33% अथवा अधिक किंतु 45% से कम
              प्राप्तांक होने पर तृतीय श्रेणी प्रदान की जाती है।
            </li>
            <li style={{ marginBottom: 3 }}>
              संगीत (गायन वादन / तबला पखावज) विषय में सैद्धांतिक व प्रायोगिक
              परीक्षा के अधिकतम अंक 25-75 एवं व्यावसायिक विषयों में सैद्धांतिक व
              प्रायोगिक परीक्षा के अधिकतम अंक 40-60 निर्धारित हैं। उत्तीर्ण होने
              के लिए दोनों भागों में न्यूनतम 33% अंक प्राप्त करना अनिवार्य है।
            </li>
            <li style={{ marginBottom: 3 }}>
              विषय में सैद्धांतिक / प्रायोगिक / आंतरिक भाग में 33% से कम
              प्राप्तांक होने की दशा में पात्रतानुसार पूरक परीक्षा देनी होगी।
              उन्हें केवल उसी भाग में पूरक परीक्षा देनी होगी जिसमें प्राप्तांक
              33% से कम हैं।
            </li>
            <li style={{ marginBottom: 3 }}>
              सतत् एवं व्यापक अधिगम तथा मूल्यांकन (CCLE) को प्रोजेक्ट /
              प्रायोजना कार्य में समाहित किया गया है।
            </li>
            <li>
              सैद्धांतिक एवं प्रायोगिक / आंतरिक भाग परीक्षा के योग के
              प्राप्तांकों के आधार पर निम्नानुसार ग्रेड निर्धारित किये गये हैं–
            </li>
          </ol>

          <table
            className="grade-tbl w-full text-center"
            style={{ borderCollapse: "collapse", border: TB, fontSize: "7pt" }}
          >
            <thead>
              <tr>
                <th
                  className="th-bg"
                  style={{ border: TB, padding: "4px 6px", textAlign: "left" }}
                >
                  प्राप्तांक
                  <br />
                  प्रतिशत
                </th>
                {[
                  "85% से 100%",
                  "75% से 84.9%",
                  "60% से 74.9%",
                  "45% से 59.9%",
                  "33% से 44.9%",
                  "20% से 32.9%",
                  "0% से 19.9%",
                ].map((r) => (
                  <th
                    key={r}
                    className="th-bg"
                    style={{ border: TB, padding: "3px 4px" }}
                  >
                    {r
                      .split(" से ")
                      .join("\nसे\n")
                      .split("\n")
                      .map((p, i) => (
                        <span key={i}>
                          {p}
                          <br />
                        </span>
                      ))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    border: TB,
                    padding: "4px 6px",
                    textAlign: "left",
                    fontWeight: "bold",
                    color: "var(--theme)",
                  }}
                >
                  ग्रेड
                </td>
                {["A+", "A", "B", "C", "D", "E1", "E2"].map((g) => (
                  <td
                    key={g}
                    style={{
                      border: TB,
                      padding: "4px",
                      fontWeight: "bold",
                      fontSize: "9pt",
                    }}
                  >
                    {g}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
