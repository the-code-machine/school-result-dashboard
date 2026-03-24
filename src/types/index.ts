export type SubjectType = "core" | "vocational" | "arts" | "language";

export interface SubjectRule {
  code: number;
  name: string;
  nameHindi?: string;
  type: SubjectType;
  thMax: number;
  prMax: number;
  thPass: number;
  prPass: number;
  hasTheory: boolean;
  hasPractical: boolean;
}

export type ClassId = "9" | "10" | "11" | "12";
export type Stream = "Science" | "Commerce" | "Arts" | "NA";
export type ExamType = "Quarterly" | "HalfYearly" | "Annual" | "Supplementary";

export interface ExamConfig {
  type: ExamType;
  label: string;
  labelHindi: string;
  enabled: boolean;
}

export interface GradeRule {
  grade: string;
  minPercent: number;
  maxPercent: number;
  label: string;
}

export interface DivisionRule {
  division: string;
  minPercent: number;
  maxPercent: number;
}

export interface ClassConfig {
  id: ClassId;
  label: string;
  stream: Stream;
  totalSubjects: number;
  maxSubjectSlots: number;
  bestOfCount: number;
  totalMaxMarks: number;
  percentageDenominator: number;
  passPercentage: number;
  failThreshold: number;
  maxFailForSuppl: number;
  exams: ExamConfig[];
  gradeScale: GradeRule[];
  divisionScale: DivisionRule[];
  allowGraceMarks: boolean;
  maxGracePerSubject: number;
  maxGraceSubjects: number;
}

export interface SchoolConfig {
  id: string;
  diseCode: string;
  mpbseCode: string;
  name: string;
  nameHindi: string;
  principal: string;
  address: string;
  block: string;
  district: string;
  state: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

export type Gender = "M" | "F" | "O";
export type Category = "GEN" | "OBC" | "SC" | "ST";
export type ResultStatus =
  | "PASS"
  | "FAIL"
  | "SUPPLEMENTARY"
  | "ABSENT"
  | "PENDING";

export interface Session {
  id: string;
  year: string;
  classId: ClassId;
  stream?: Stream;
  section?: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  createdAt: string;
}

export interface SubjectMarks {
  slot: number;
  subjectCode: number;
  quarterly?: {
    th: number | null;
    pr: number | null;
    isAbsent: boolean;
  };
  halfYearly?: {
    th: number | null;
    pr: number | null;
    isAbsent: boolean;
  };
  annual: {
    th: number | null;
    pr: number | null;
    isAbsent: boolean;
  };
  graceMarks: number;
}

export interface StudentComputed {
  subjectTotals: Array<{
    slot: number;
    total: number;
    max: number;
    isPassed: boolean;
    grade: string;
  }>;
  grandTotal: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  division: string;
  result: ResultStatus;
  rank?: number;
  subjectsFailed: number;
  subjectsAbsent: number;
}

export interface Student {
  id: string;
  sessionId: string;
  rollNumber: string;
  scholarNumber?: string;
  sssmid?: string;
  enrolmentNumber?: string;
  name: string;
  nameHindi?: string;
  fatherName: string;
  motherName?: string;
  dob?: string;
  gender: Gender;
  category: Category;
  medium: string;
  section?: string;
  marks: SubjectMarks[];
  computed?: StudentComputed;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}
