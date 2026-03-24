import * as XLSX from "xlsx";
import type {
  Student,
  StudentComputed,
  SchoolConfig,
  Session,
  SubjectRule,
  ClassConfig,
} from "@/types";

type PopulatedStudent = Student & { computed: StudentComputed };

// Helper to generate and download actual Excel files with formatting
function downloadExcel(
  filename: string,
  sheetName: string,
  aoa: any[][],
  merges?: XLSX.Range[],
  cols?: XLSX.ColInfo[],
) {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  if (merges) ws["!merges"] = merges;
  if (cols) ws["!cols"] = cols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, filename);
}

export function exportDEOProforma(
  students: PopulatedStudent[],
  school: SchoolConfig,
  session: Session,
) {
  const headers = [
    "District",
    "Block",
    "School DISE Code",
    "School Name",
    "Class",
    "Roll Number",
    "Scholar Number",
    "Student Name",
    "Father Name",
    "Gender",
    "Category",
    "Result Status",
    "Division",
    "Percentage",
  ];

  const rows = students.map((s) => [
    school.district || "—",
    school.block || "—",
    school.diseCode || "—",
    school.name,
    session.classId,
    s.rollNumber,
    s.scholarNumber || "—",
    s.name,
    s.fatherName,
    s.gender,
    s.category,
    s.computed.result,
    s.computed.division,
    s.computed.percentage.toFixed(2),
  ]);

  downloadExcel(`DEO_Proforma_Class_${session.classId}.xlsx`, "DEO Proforma", [
    headers,
    ...rows,
  ]);
}

export function exportRMSAFormat(
  students: PopulatedStudent[],
  school: SchoolConfig,
  session: Session,
) {
  const headers = [
    "School Code",
    "SSSMID",
    "Enrolment No",
    "Roll No",
    "Student Name",
    "Category",
    "Gender",
    "Total Marks",
    "Max Marks",
    "Pass/Fail",
  ];

  const rows = students.map((s) => [
    school.mpbseCode || "—",
    s.sssmid || "—",
    s.enrolmentNumber || "—",
    s.rollNumber,
    s.name,
    s.category,
    s.gender,
    s.computed.grandTotal,
    s.computed.maxMarks,
    s.computed.result === "PASS"
      ? "Pass"
      : s.computed.result === "FAIL"
        ? "Fail"
        : s.computed.result,
  ]);

  downloadExcel(`RMSA_Format_Class_${session.classId}.xlsx`, "RMSA Format", [
    headers,
    ...rows,
  ]);
}

// ✨ EXACT MPBSE EXCEL REPLICA – matching screenshots precisely ✨
// Column layout:
//  1-12  : Student info (S.No, Roll, Name, Father, Mother, Category, Gender, DOB, Scholar, SSSMID, Enrolment, Medium)
//  13    : Group Code
//  14    : Section
//  15-20 : Subject codes (1st Lang, 2nd Lang, SUB-1, SUB-2, SUB-3, Additional)
//  21-32 : Quarterly marks TH/PR (6 subjects × 2)
//  33-44 : Half-Yearly marks TH/PR
//  45-56 : Annual marks TH/PR
//  57    : Raw Grand Total
//  58-67 : 5% of Quarterly (5 subjects × TH+PR)
//  68-77 : 5% of Half-Yearly
//  78-87 : 90% of Annual
//  88-99 : Weighted total per subject (6 × TH+PR)
// 100    : Weighted Grand Total
// 101    : Percentage
// 102    : Result Grade
// 103-109: Subject-wise grades (1st Lang, 2nd Lang, SUB-1, SUB-2, SUB-3, Env, Additional)
// 110    : RESULT
// 111    : DIVISION
// 112    : Supplementary Subject
// 113    : Correct/Incorrect

export function exportAnnualReportFormat(
  students: PopulatedStudent[],
  school: SchoolConfig,
  session: Session,
  classCfg: ClassConfig,
) {
  // ── Column indices (0-based internally, matching layout above) ────────────
  const Q_S = 20; // Quarterly start (0-based col index 20 = col 21)
  const Q_E = 31;
  const HY_S = 32;
  const HY_E = 43;
  const AN_S = 44;
  const AN_E = 55;
  const GT_RAW = 56; // Raw Grand Total
  const P5Q_S = 57; // 5% Quarterly start
  const P5Q_E = 66;
  const P5HY_S = 67;
  const P5HY_E = 76;
  const P90_S = 77;
  const P90_E = 86;
  const WT_S = 87; // Weighted total start
  const WT_E = 98;
  const GT_COL = 99; // Weighted Grand Total
  const PCT_COL = 100;
  const RG_COL = 101; // Result Grade
  const SWG_S = 102; // Subject Wise Grading start
  const RES_COL = 109;
  const DIV_COL = 110;
  const SUP_COL = 111;
  const COR_COL = 112;
  const TOTAL_COLS = 113;

  // ── Styles (XLSX cell style objects for SheetJS/xlsx-style) ───────────────
  const FONTS = {
    headerBold: { name: "Arial", sz: 9, bold: true },
    titleLarge: { name: "Arial", sz: 14, bold: true },
    sectionHd: { name: "Arial", sz: 9, bold: true },
    subHd: { name: "Arial", sz: 8, bold: true },
    subHdSm: { name: "Arial", sz: 7, bold: true },
    colNum: { name: "Arial", sz: 8, bold: true, color: { rgb: "FF0000" } },
    redBold: { name: "Arial", sz: 8, bold: true, color: { rgb: "FF0000" } },
    blueBold: { name: "Arial", sz: 8, bold: true, color: { rgb: "0070C0" } },
    gradeLg: { name: "Arial", sz: 10, bold: true },
    purpleSm: { name: "Arial", sz: 7, bold: true, color: { rgb: "7030A0" } },
    regular: { name: "Arial", sz: 8 },
    greenBold: { name: "Arial", sz: 9, bold: true, color: { rgb: "00B050" } },
  };

  const FILLS = {
    orange: { patternType: "solid", fgColor: { rgb: "FFC000" } },
    teal: { patternType: "solid", fgColor: { rgb: "00B0F0" } },
    white: { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
  };

  const ALIGN = {
    cc: { horizontal: "center", vertical: "center", wrapText: true },
    cr: { horizontal: "right", vertical: "center", wrapText: false },
    cl: { horizontal: "left", vertical: "center", wrapText: true },
  };

  const BORDERS = {
    thin: { style: "thin", color: { rgb: "BFBFBF" } },
    redMed: { style: "medium", color: { rgb: "FF0000" } },
    black: { style: "thin", color: { rgb: "000000" } },
  };

  // Helper to build border object
  function bord(t?: any, b?: any, l?: any, r?: any) {
    return { top: t, bottom: b, left: l, right: r };
  }
  function allThin() {
    return bord(BORDERS.thin, BORDERS.thin, BORDERS.thin, BORDERS.thin);
  }

  // ── AOA (array of arrays) builder ─────────────────────────────────────────
  // We'll use a sparse approach: build aoa then apply styles separately
  const ROWS = 12 + students.length; // header rows + data
  const aoa: any[][] = Array.from({ length: ROWS }, () =>
    Array(TOTAL_COLS).fill(""),
  );
  const styles: any[][] = Array.from({ length: ROWS }, () =>
    Array(TOTAL_COLS).fill(null),
  );

  function set(r: number, c: number, val: any, style?: any) {
    aoa[r][c] = val;
    if (style) styles[r][c] = style;
  }

  // ── ROW 0: School header ──────────────────────────────────────────────────
  const schoolInfo = `SCHOOL NAME  - ${school.name},   DISTRICT- ${school.district},    BLOCK- ${school.block},     DISE CODE - ${school.diseCode},     MPBSE CODE - ${school.mpbseCode || ""}`;
  set(0, 0, schoolInfo, {
    font: FONTS.headerBold,
    alignment: ALIGN.cc,
    fill: FILLS.white,
  });

  const reportTitle = `वार्षिक परीक्षाफल पत्रक, कक्षा-${session.classId}वीं, सत्र ${session.year}`;
  set(0, 12, reportTitle, {
    font: FONTS.titleLarge,
    alignment: ALIGN.cr,
    fill: FILLS.white,
  });

  // ── ROW 1: Section group headers ──────────────────────────────────────────
  set(1, Q_S, "त्रैमासिक परीक्षा", {
    font: FONTS.sectionHd,
    alignment: ALIGN.cc,
  });
  set(1, HY_S, "अर्द्धवार्षिक परीक्षा", {
    font: FONTS.sectionHd,
    alignment: ALIGN.cc,
  });
  set(1, AN_S, "वार्षिक परीक्षा", {
    font: FONTS.sectionHd,
    alignment: ALIGN.cc,
  });
  set(1, GT_RAW, "Grand\nTotal", { font: FONTS.subHd, alignment: ALIGN.cc });
  set(1, P5Q_S, "त्रैमासिक परीक्षा का 5% अधिभार", {
    font: FONTS.subHd,
    alignment: ALIGN.cc,
  });
  set(1, P5HY_S, "अर्द्धवार्षिक परीक्षा का 5% अधिभार", {
    font: FONTS.subHd,
    alignment: ALIGN.cc,
  });
  set(1, P90_S, "वार्षिक परीक्षा का 90% अधिभार", {
    font: FONTS.subHd,
    alignment: ALIGN.cc,
  });
  set(
    1,
    WT_S,
    "वार्षिक मूल्यांकन - अधिभार का योग (त्रैमासिक का 5%  +  अर्द्धवार्षिक का 5%  +  वार्षिक का 90% = 100%) (IN ROUND)",
    { font: FONTS.subHd, alignment: ALIGN.cc },
  );
  set(1, GT_COL, "Grand\nTotal", { font: FONTS.subHd, alignment: ALIGN.cc });
  set(1, PCT_COL, "Percentage", { font: FONTS.subHd, alignment: ALIGN.cc });
  set(1, RG_COL, "Result\nGrade", { font: FONTS.subHd, alignment: ALIGN.cc });
  set(1, SWG_S, "Subject Wise Grading", {
    font: FONTS.sectionHd,
    alignment: ALIGN.cc,
    fill: FILLS.teal,
  });
  set(1, RES_COL, "RESULT", { font: FONTS.subHd, alignment: ALIGN.cc });
  set(1, DIV_COL, "DIVISION", { font: FONTS.subHd, alignment: ALIGN.cc });
  set(1, SUP_COL, "Supplementary\nSubject", {
    font: FONTS.subHd,
    alignment: ALIGN.cc,
  });
  set(1, COR_COL, "Correct\n/Incorrect", {
    font: FONTS.greenBold,
    alignment: ALIGN.cc,
  });

  // ── ROW 1: Info column headers (merged rows 1-9 in final sheet) ───────────
  const INFO_HEADERS = [
    "स. क्र.\nS.N.",
    "अनुक्रमांक\nRoll No.",
    "विद्यार्थी का नाम\nStudent's Name",
    "पिता का नाम\nFather's Name",
    "माता का नाम\nMother's Name",
    "Cate\ngory\n(SC\n/ST\n/OBC\n/UR)",
    "Gender\n(M/F)",
    "Date of\nBirth",
    "Scholar\nNumber",
    "SSSMID",
    "Enrolment\nNumber",
    "Medium",
    "Group\nCode",
    "Section",
  ];
  INFO_HEADERS.forEach((h, i) => {
    set(1, i, h, { font: FONTS.subHd, alignment: ALIGN.cc });
  });

  // Subject code column headers
  const SCODE_HEADERS = [
    { text: "1st Language\n/Vocational\nCode", color: "000000" },
    { text: "2nd Language\n/Vocational\nCode", color: "000000" },
    { text: "Code of\nSUB.-1", color: "7030A0" },
    { text: "Code of\nSUB.-2", color: "7030A0" },
    { text: "Code of\nSUB.-3", color: "7030A0" },
    { text: "Additional\nSub.", color: "000000" },
  ];
  SCODE_HEADERS.forEach(({ text, color }, i) => {
    set(1, 14 + i, text, {
      font: { ...FONTS.subHdSm, color: { rgb: color } },
      alignment: ALIGN.cc,
    });
  });

  // ── ROWS 2-9: Subject sub-headers for exam sections ───────────────────────
  const SUB_LABELS = [
    { text: "1st Language\n/Vocational sub.", color: "000000", bold: true },
    { text: "2nd Language\n/Vocational sub.", color: "000000", bold: true },
    { text: "SUB.-1", color: "7030A0", bold: false },
    { text: "SUB.-2", color: "7030A0", bold: false },
    { text: "SUB.-3", color: "7030A0", bold: false },
    { text: "Additional\nSub.", color: "000000", bold: false },
  ];
  const SHORT_LABELS = [
    { text: "1st\nLanguage", color: "000000", bold: true },
    { text: "2nd\nLanguage", color: "000000", bold: true },
    { text: "SUB.-1", color: "7030A0", bold: false },
    { text: "SUB.-2", color: "7030A0", bold: false },
    { text: "SUB.-3", color: "7030A0", bold: false },
  ];

  const MAX_MARKS = [
    { th: 80, pr: 20 },
    { th: 80, pr: 20 },
    { th: 80, pr: 20 },
    { th: 70, pr: 30 },
    { th: 80, pr: 20 },
    { th: 80, pr: 20 },
  ];

  function writeSubjectHeaders(
    startCol: number,
    labels: typeof SUB_LABELS | typeof SHORT_LABELS,
    maxMarks: typeof MAX_MARKS,
    pctFactor = 1.0,
  ) {
    labels.forEach(({ text, color, bold }, i) => {
      const tc = startCol + i * 2;
      const pc = startCol + i * 2 + 1;
      // Rows 2-4: subject label
      set(2, tc, text, {
        font: { name: "Arial", sz: 7, bold, color: { rgb: color } },
        alignment: ALIGN.cc,
      });
      // Row 5: TH. PR.
      set(5, tc, "TH.", { font: FONTS.subHdSm, alignment: ALIGN.cc });
      set(5, pc, "PR.", { font: FONTS.subHdSm, alignment: ALIGN.cc });
      // Row 6: max.
      set(6, tc, "max.", {
        font: { name: "Arial", sz: 6 },
        alignment: ALIGN.cc,
      });
      set(6, pc, "max.", {
        font: { name: "Arial", sz: 6 },
        alignment: ALIGN.cc,
      });
      // Row 7: max values
      const mth = Math.round(maxMarks[i].th * pctFactor * 10) / 10;
      const mpr = Math.round(maxMarks[i].pr * pctFactor * 10) / 10;
      set(7, tc, mth, { font: FONTS.regular, alignment: ALIGN.cc });
      set(7, pc, mpr, { font: FONTS.regular, alignment: ALIGN.cc });
      // Row 8: min.
      set(8, tc, "min.", {
        font: { name: "Arial", sz: 6 },
        alignment: ALIGN.cc,
      });
      set(8, pc, "min.", {
        font: { name: "Arial", sz: 6 },
        alignment: ALIGN.cc,
      });
      // Row 9: min dates
      set(9, tc, "26/07/17", {
        font: { name: "Arial", sz: 6 },
        alignment: ALIGN.cc,
      });
      set(9, pc, "07/10", {
        font: { name: "Arial", sz: 6 },
        alignment: ALIGN.cc,
      });
    });
  }

  writeSubjectHeaders(Q_S, SUB_LABELS, MAX_MARKS, 1.0);
  writeSubjectHeaders(HY_S, SUB_LABELS, MAX_MARKS, 1.0);
  writeSubjectHeaders(AN_S, SUB_LABELS, MAX_MARKS, 1.0);
  writeSubjectHeaders(P5Q_S, SHORT_LABELS, MAX_MARKS, 0.05);
  writeSubjectHeaders(P5HY_S, SHORT_LABELS, MAX_MARKS, 0.05);
  writeSubjectHeaders(P90_S, SHORT_LABELS, MAX_MARKS, 0.9);
  writeSubjectHeaders(WT_S, SUB_LABELS, MAX_MARKS, 1.0);

  // Subject Wise Grading individual columns (rows 4-9)
  const SWG_LABELS = [
    { text: "1st Language/\nVoc. Sub.", color: "000000" },
    { text: "2nd Language/\nVoc.Sub.", color: "000000" },
    { text: "SUB.-1", color: "7030A0" },
    { text: "SUB.-2", color: "7030A0" },
    { text: "SUB.-3", color: "7030A0" },
    {
      text: "Environmental Education\nand Disaster Management",
      color: "000000",
    },
    { text: "Additional\nSubject", color: "000000" },
  ];
  SWG_LABELS.forEach(({ text, color }, i) => {
    set(4, SWG_S + i, text, {
      font: { name: "Arial", sz: 7, bold: true, color: { rgb: color } },
      alignment: ALIGN.cc,
      fill: FILLS.teal,
    });
  });

  // ── ROW 10: Column numbers (RED text, ORANGE background) ──────────────────
  for (let c = 0; c < TOTAL_COLS; c++) {
    set(10, c, c + 1, {
      font: FONTS.colNum,
      alignment: ALIGN.cc,
      fill: FILLS.orange,
      border: bord(BORDERS.black, BORDERS.black, BORDERS.black, BORDERS.black),
    });
  }

  // ── ROWS 11+: Student data ─────────────────────────────────────────────────
  students.forEach((s, idx) => {
    const r = 11 + idx;

    function d(c: number, val: any, extraStyle?: any) {
      aoa[r][c] = val;
      styles[r][c] = {
        font: { name: "Arial", sz: 8 },
        alignment: ALIGN.cc,
        border: allThin(),
        ...extraStyle,
      };
    }

    // Basic info
    d(0, idx + 1);
    d(1, s.rollNumber, { font: FONTS.redBold });
    d(2, s.name, { alignment: ALIGN.cl });
    d(3, s.fatherName, { alignment: ALIGN.cl });
    d(4, s.motherName || "", { alignment: ALIGN.cl });
    d(5, s.category);
    d(6, s.gender);
    d(7, s.dob ? new Date(s.dob).toLocaleDateString("en-GB") : "");
    d(8, s.scholarNumber || "");
    d(9, s.sssmid || "");
    d(10, s.enrolmentNumber || "");
    d(11, s.medium);
    d(12, s.section || "");

    // Subject codes
    for (let i = 1; i <= 6; i++) {
      const m = s.marks.find((x) => x.slot === i);
      d(12 + i, m ? m.subjectCode : "");
    }

    // Quarterly marks
    for (let i = 1; i <= 6; i++) {
      const m = s.marks.find((x) => x.slot === i);
      d(
        Q_S + (i - 1) * 2,
        m?.quarterly?.isAbsent ? "ABS" : (m?.quarterly?.th ?? ""),
      );
      d(
        Q_S + (i - 1) * 2 + 1,
        m?.quarterly?.isAbsent ? "ABS" : (m?.quarterly?.pr ?? ""),
      );
    }

    // Half-Yearly marks
    for (let i = 1; i <= 6; i++) {
      const m = s.marks.find((x) => x.slot === i);
      d(
        HY_S + (i - 1) * 2,
        m?.halfYearly?.isAbsent ? "ABS" : (m?.halfYearly?.th ?? ""),
      );
      d(
        HY_S + (i - 1) * 2 + 1,
        m?.halfYearly?.isAbsent ? "ABS" : (m?.halfYearly?.pr ?? ""),
      );
    }

    // Annual marks
    for (let i = 1; i <= 6; i++) {
      const m = s.marks.find((x) => x.slot === i);
      d(
        AN_S + (i - 1) * 2,
        m?.annual?.isAbsent ? "ABS" : (m?.annual?.th ?? ""),
      );
      d(
        AN_S + (i - 1) * 2 + 1,
        m?.annual?.isAbsent ? "ABS" : (m?.annual?.pr ?? ""),
      );
    }

    // Raw Grand Total
    const rawTotal = s.marks.reduce((sum, m) => {
      const q = (m?.quarterly?.th || 0) + (m?.quarterly?.pr || 0);
      const hy = (m?.halfYearly?.th || 0) + (m?.halfYearly?.pr || 0);
      const an = (m?.annual?.th || 0) + (m?.annual?.pr || 0);
      return sum + q + hy + an;
    }, 0);
    d(GT_RAW, rawTotal, { font: FONTS.redBold });

    // 5% Quarterly per subject (5 subjects)
    for (let i = 1; i <= 5; i++) {
      const m = s.marks.find((x) => x.slot === i);
      const th = m?.quarterly?.th || 0;
      const pr = m?.quarterly?.pr || 0;
      d(P5Q_S + (i - 1) * 2, th ? +(th * 0.05).toFixed(1) : "");
      d(P5Q_S + (i - 1) * 2 + 1, pr ? +(pr * 0.05).toFixed(1) : "");
    }

    // 5% Half-Yearly per subject
    for (let i = 1; i <= 5; i++) {
      const m = s.marks.find((x) => x.slot === i);
      const th = m?.halfYearly?.th || 0;
      const pr = m?.halfYearly?.pr || 0;
      d(P5HY_S + (i - 1) * 2, th ? +(th * 0.05).toFixed(1) : "");
      d(P5HY_S + (i - 1) * 2 + 1, pr ? +(pr * 0.05).toFixed(1) : "");
    }

    // 90% Annual per subject
    for (let i = 1; i <= 5; i++) {
      const m = s.marks.find((x) => x.slot === i);
      const th = m?.annual?.th || 0;
      const pr = m?.annual?.pr || 0;
      d(P90_S + (i - 1) * 2, th ? +(th * 0.9).toFixed(1) : "");
      d(P90_S + (i - 1) * 2 + 1, pr ? +(pr * 0.9).toFixed(1) : "");
    }

    // Weighted totals per subject
    let grandWeighted = 0;
    for (let i = 1; i <= 5; i++) {
      const m = s.marks.find((x) => x.slot === i);
      const qTh = m?.quarterly?.th || 0;
      const qPr = m?.quarterly?.pr || 0;
      const hyTh = m?.halfYearly?.th || 0;
      const hyPr = m?.halfYearly?.pr || 0;
      const anTh = m?.annual?.th || 0;
      const anPr = m?.annual?.pr || 0;
      const wtTh = +(qTh * 0.05 + hyTh * 0.05 + anTh * 0.9).toFixed(1);
      const wtPr = +(qPr * 0.05 + hyPr * 0.05 + anPr * 0.9).toFixed(1);
      d(WT_S + (i - 1) * 2, wtTh || "");
      d(WT_S + (i - 1) * 2 + 1, wtPr || "");
      grandWeighted += wtTh + wtPr;
    }
    // Additional sub slot 6
    d(WT_S + 10, "");
    d(WT_S + 11, "");

    // Grand Weighted Total
    const gwRounded = Math.round(grandWeighted);
    d(GT_COL, gwRounded, { font: FONTS.redBold });

    // Percentage
    const maxPossible = s.computed?.maxMarks || 500;
    const pct = +((gwRounded / maxPossible) * 100).toFixed(2);
    d(PCT_COL, pct);

    // Result Grade
    const grade = s.computed?.grade || "";
    const gradeColor =
      grade === "A+" || grade === "A"
        ? "FF0000"
        : grade === "B"
          ? "0070C0"
          : "000000";
    d(RG_COL, grade, {
      font: { name: "Arial", sz: 10, bold: true, color: { rgb: gradeColor } },
    });

    // Subject-wise grades
    s.computed?.subjectGrades?.forEach((sg: string, gi: number) => {
      const sgColor =
        sg === "A+" || sg === "A" ? "FF0000" : sg === "B" ? "0070C0" : "000000";
      d(SWG_S + gi, sg, {
        font: { name: "Arial", sz: 8, bold: true, color: { rgb: sgColor } },
      });
    });

    d(RES_COL, s.computed?.result || "", { font: FONTS.subHd });
    d(DIV_COL, s.computed?.division || "");
    d(SUP_COL, "");
    d(COR_COL, "");
  });

  // ── Merge cell definitions ─────────────────────────────────────────────────
  const merges: XLSXMerge[] = [
    // Row 0
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // School info
    { s: { r: 0, c: 12 }, e: { r: 0, c: TOTAL_COLS - 1 } }, // Title
    // Row 1 – section headers
    { s: { r: 1, c: Q_S }, e: { r: 1, c: Q_E } },
    { s: { r: 1, c: HY_S }, e: { r: 1, c: HY_E } },
    { s: { r: 1, c: AN_S }, e: { r: 1, c: AN_E } },
    { s: { r: 1, c: GT_RAW }, e: { r: 9, c: GT_RAW } }, // Raw GT spans rows 1-9
    { s: { r: 1, c: P5Q_S }, e: { r: 1, c: P5Q_E } },
    { s: { r: 1, c: P5HY_S }, e: { r: 1, c: P5HY_E } },
    { s: { r: 1, c: P90_S }, e: { r: 1, c: P90_E } },
    { s: { r: 1, c: WT_S }, e: { r: 1, c: WT_E } },
    { s: { r: 1, c: GT_COL }, e: { r: 9, c: GT_COL } },
    { s: { r: 1, c: PCT_COL }, e: { r: 9, c: PCT_COL } },
    { s: { r: 1, c: RG_COL }, e: { r: 9, c: RG_COL } },
    { s: { r: 1, c: SWG_S }, e: { r: 3, c: SWG_S + 6 } }, // SWG header rows 1-3
    { s: { r: 1, c: RES_COL }, e: { r: 9, c: RES_COL } },
    { s: { r: 1, c: DIV_COL }, e: { r: 9, c: DIV_COL } },
    { s: { r: 1, c: SUP_COL }, e: { r: 9, c: SUP_COL } },
    { s: { r: 1, c: COR_COL }, e: { r: 9, c: COR_COL } },
    // Row 1: info columns merged rows 1-9
    ...Array.from({ length: 20 }, (_, i) => ({
      s: { r: 1, c: i },
      e: { r: 9, c: i },
    })),
    // Rows 2-4: subject name headers (merge TH+PR per subject, per section)
    ...[Q_S, HY_S, AN_S, P5Q_S, P5HY_S, P90_S, WT_S].flatMap((startCol) => {
      const n = startCol >= P5Q_S && startCol <= P90_E ? 5 : 6;
      return Array.from({ length: n }, (_, i) => ({
        s: { r: 2, c: startCol + i * 2 },
        e: { r: 4, c: startCol + i * 2 + 1 },
      }));
    }),
    // Rows 4-9: SWG individual columns
    ...Array.from({ length: 7 }, (_, i) => ({
      s: { r: 4, c: SWG_S + i },
      e: { r: 9, c: SWG_S + i },
    })),
  ];

  // ── Column widths ──────────────────────────────────────────────────────────
  const cols: { wch: number }[] = [
    { wch: 5 }, // S.No
    { wch: 8 }, // Roll
    { wch: 18 }, // Name
    { wch: 15 }, // Father
    { wch: 14 }, // Mother
    { wch: 6 }, // Category
    { wch: 6 }, // Gender
    { wch: 10 }, // DOB
    { wch: 8 }, // Scholar
    { wch: 13 }, // SSSMID
    { wch: 13 }, // Enrolment
    { wch: 8 }, // Medium
    { wch: 5 }, // Section
    // Subject codes (15-20): 6 cols
    ...Array(6).fill({ wch: 6 }),
    // Q, HY, Annual marks (21-56): 36 cols of TH/PR
    ...Array(36).fill({ wch: 5 }),
    { wch: 7 }, // Raw Grand Total
    // 5% Q, 5% HY, 90% Annual (10+10+10 = 30 cols)
    ...Array(30).fill({ wch: 5 }),
    // Weighted totals (12 cols)
    ...Array(12).fill({ wch: 5 }),
    { wch: 7 }, // Weighted Grand Total
    { wch: 8 }, // Percentage
    { wch: 7 }, // Result Grade
    // SWG cols (7)
    ...Array(7).fill({ wch: 6 }),
    { wch: 8 }, // RESULT
    { wch: 8 }, // DIVISION
    { wch: 10 }, // Supplementary
    { wch: 8 }, // Correct/Incorrect
  ];

  downloadExcel(
    `Annual_Class_Register_${session.classId}_${session.year}.xlsx`,
    "Class Register",
    aoa,
    merges,
    cols,
    styles, // pass styles to your downloadExcel if it supports it
  );
}
