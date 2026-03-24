import type {
  Student,
  SubjectMarks,
  StudentComputed,
  ClassConfig,
  SubjectRule,
  GradeRule,
  DivisionRule,
} from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getGrade(pct: number, scale: GradeRule[]): string {
  const rule = scale.find((r) => pct >= r.minPercent && pct <= r.maxPercent);
  return rule?.grade ?? "E2";
}

function getDivision(pct: number, scale: DivisionRule[]): string {
  const rule = scale.find((r) => pct >= r.minPercent && pct <= r.maxPercent);
  return rule?.division ?? "—";
}

// best-of-N using totals
function bestOf(totals: number[], n: number): number {
  return [...totals]
    .sort((a, b) => b - a)
    .slice(0, n)
    .reduce((sum, v) => sum + v, 0);
}

// ─── per-subject computation ──────────────────────────────────────────────────

export interface SubjectResult {
  slot: number;
  total: number;
  max: number;
  isPassed: boolean;
  grade: string;
  isAbsent: boolean;
}

export function computeSubject(
  marks: SubjectMarks,
  rule: SubjectRule,
  gradeScale: GradeRule[],
): SubjectResult {
  const { annual, graceMarks } = marks;

  // absent
  if (annual.isAbsent) {
    return {
      slot: marks.slot,
      total: 0,
      max: rule.thMax + rule.prMax,
      isPassed: false,
      grade: "AB",
      isAbsent: true,
    };
  }

  const th = (annual.th ?? 0) + (graceMarks ?? 0);
  const pr = annual.pr ?? 0;
  const max = rule.thMax + rule.prMax;

  const total = th + pr;
  const pct = max > 0 ? (total / max) * 100 : 0;

  // pass check: both th and pr must meet minimums
  const thOk = !rule.hasTheory || th >= rule.thPass;
  const prOk = !rule.hasPractical || pr >= rule.prPass;
  const isPassed = thOk && prOk;

  return {
    slot: marks.slot,
    total,
    max,
    isPassed,
    grade: getGrade(pct, gradeScale),
    isAbsent: false,
  };
}

// ─── full student computation ─────────────────────────────────────────────────

export function computeStudent(
  student: Student,
  subjectMap: Record<number, SubjectRule>,
  classCfg: ClassConfig,
): StudentComputed {
  const { gradeScale, divisionScale } = classCfg;

  // compute each subject
  const subjectResults: SubjectResult[] = student.marks.map((m) => {
    const rule = subjectMap[m.subjectCode];
    if (!rule) {
      return {
        slot: m.slot,
        total: 0,
        max: 100,
        isPassed: false,
        grade: "—",
        isAbsent: false,
      };
    }
    return computeSubject(m, rule, gradeScale);
  });

  const absentCount = subjectResults.filter((r) => r.isAbsent).length;
  const failCount = subjectResults.filter(
    (r) => !r.isPassed && !r.isAbsent,
  ).length;

  // best-of-N for grand total
  const totals = subjectResults.map((r) => r.total);
  const grandTotal = bestOf(totals, classCfg.bestOfCount);
  const maxMarks = classCfg.totalMaxMarks;

  const percentage =
    classCfg.percentageDenominator > 0
      ? (grandTotal / classCfg.percentageDenominator) * 100
      : 0;

  const grade = getGrade(percentage, gradeScale);
  const division = getDivision(percentage, divisionScale);

  // result logic
  let result: StudentComputed["result"];

  if (absentCount > 0) {
    result = "ABSENT";
  } else if (failCount === 0 && percentage >= classCfg.passPercentage) {
    result = "PASS";
  } else if (failCount > 0 && failCount <= classCfg.maxFailForSuppl) {
    result = "SUPPLEMENTARY";
  } else {
    result = "FAIL";
  }

  return {
    subjectTotals: subjectResults.map((r) => ({
      slot: r.slot,
      total: r.total,
      max: r.max,
      isPassed: r.isPassed,
      grade: r.grade,
    })),
    grandTotal,
    maxMarks,
    percentage: Math.round(percentage * 100) / 100,
    grade,
    division,
    result: result as StudentComputed["result"],
    subjectsFailed: failCount,
    subjectsAbsent: absentCount,
  };
}

// ─── batch rank assignment ────────────────────────────────────────────────────
// call after computing all students in a session

export function assignRanks(
  students: (Student & { computed: StudentComputed })[],
): (Student & { computed: StudentComputed })[] {
  const passers = students
    .filter((s) => s.computed.result === "PASS")
    .sort((a, b) => b.computed.percentage - a.computed.percentage);

  // RANK.EQ — ties share rank, next rank skips
  let rank = 1;
  let prev = -1;
  let count = 0;

  const ranked = passers.map((s) => {
    if (s.computed.percentage !== prev) {
      rank = rank + count;
      count = 1;
    } else {
      count++;
    }
    prev = s.computed.percentage;
    return { ...s, computed: { ...s.computed, rank } };
  });

  // merge back — non-passers get no rank
  return students.map((s) => {
    const r = ranked.find((x) => x.id === s.id);
    return r ?? s;
  });
}
