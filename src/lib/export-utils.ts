import type {
  Student,
  StudentComputed,
  SchoolConfig,
  Session,
  SubjectRule,
} from "@/types";

function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

type PopulatedStudent = Student & { computed: StudentComputed };

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

  downloadCSV(`DEO_Proforma_Class_${session.classId}_${session.year}.csv`, [
    headers,
    ...rows,
  ]);
}

export function exportVimarshFormat(
  students: PopulatedStudent[],
  school: SchoolConfig,
  session: Session,
  subjects: SubjectRule[],
) {
  const subjectMap = Object.fromEntries(
    subjects.map((sub) => [sub.code, sub.name]),
  );

  // Find all unique slots used in this session to create dynamic columns
  const allSlots = Array.from(
    new Set(students.flatMap((s) => s.marks.map((m) => m.slot))),
  ).sort((a, b) => a - b);

  const baseHeaders = [
    "DISE Code",
    "Roll No",
    "Student Name",
    "Father Name",
    "Mother Name",
    "DOB",
    "Gender",
    "Category",
  ];

  const subjectHeaders = allSlots.flatMap((slot) => [
    `Sub ${slot} Code`,
    `Sub ${slot} Name`,
    `Sub ${slot} Total`,
    `Sub ${slot} Grade`,
  ]);

  const tailHeaders = ["Grand Total", "Percentage", "Final Grade", "Result"];

  const headers = [...baseHeaders, ...subjectHeaders, ...tailHeaders];

  const rows = students.map((s) => {
    const baseData = [
      school.diseCode,
      s.rollNumber,
      s.name,
      s.fatherName,
      s.motherName || "—",
      s.dob || "—",
      s.gender,
      s.category,
    ];

    const subjectData = allSlots.flatMap((slot) => {
      const mark = s.marks.find((m) => m.slot === slot);
      const computedSub = s.computed.subjectTotals.find((t) => t.slot === slot);

      if (!mark || !computedSub) return ["—", "—", "—", "—"];
      return [
        mark.subjectCode,
        subjectMap[mark.subjectCode] || "Unknown",
        computedSub.total,
        computedSub.grade,
      ];
    });

    const tailData = [
      s.computed.grandTotal,
      s.computed.percentage.toFixed(2),
      s.computed.grade,
      s.computed.result,
    ];

    return [...baseData, ...subjectData, ...tailData];
  });

  downloadCSV(
    `Vimarsh_Main_Grade_Class_${session.classId}_${session.year}.csv`,
    [headers, ...rows],
  );
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

  downloadCSV(`RMSA_Format_Class_${session.classId}_${session.year}.csv`, [
    headers,
    ...rows,
  ]);
}
