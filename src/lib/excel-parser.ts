import * as XLSX from "xlsx";
import type {
  Student,
  SubjectMarks,
  Gender,
  Category,
  ClassId,
  Stream,
} from "@/types";
import { computeStudent } from "@/lib/compute";
import { useSettingsStore } from "@/store/settings";

// Convert Excel Serial Date (e.g., 41850) or String ('16/04/2012) to standard YYYY-MM-DD
function parseExcelDate(serial: any) {
  if (!serial) return "";

  // 1. Handle Excel numeric serial dates
  if (typeof serial === "number") {
    // Excel's epoch starts at Jan 1, 1900 (with a leap year bug offset)
    const d = new Date((serial - 25569) * 86400000);
    return d.toISOString().split("T")[0];
  }

  // 2. Handle native Date objects
  if (serial instanceof Date) {
    return serial.toISOString().split("T")[0];
  }

  // 3. Handle string dates like "'16/04/2012" or "16-04-2012"
  let strVal = String(serial).trim().replace(/^'/, ""); // Remove leading apostrophe if present

  // Split by common delimiters
  const parts = strVal.split(/[-/]/);
  if (parts.length === 3) {
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];

    // If it came in as YYYY-MM-DD already
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }

    // Return strict YYYY-MM-DD format
    if (year.length === 4) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  // Fallback to the raw string if format is completely unknown
  return strVal;
}

// Handle 'A' for absent or numeric marks
function parseMark(val: any): { mark: number | null; isAbsent: boolean } {
  if (val === "A" || val === "a" || val === "ABS" || val === "abs") {
    return { mark: 0, isAbsent: true };
  }
  const num = Number(val);
  return { mark: isNaN(num) ? null : num, isAbsent: false };
}

export async function parseExcelToStudents(
  file: File,
  sessionId: string,
  classId: ClassId,
): Promise<Student[]> {
  const { subjects, classConfigs } = useSettingsStore.getState();
  const classCfg = classConfigs[classId];
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.code, s]));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Find the specific "DATA" Sheet. If multiple exist, take the first one to avoid calculation sheets.
        const sheetName =
          workbook.SheetNames.find(
            (n) =>
              n.toLowerCase() === "data sheet" || n.toLowerCase() === "data",
          ) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to 2D array
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        const students: Student[] = [];
        const seenRolls = new Set<string>(); // Prevent double-counting if the sheet has mirrored calculation tables below

        // Skip headers (usually first 4-6 rows in MPBSE sheets depending on the school's format)
        let startRow = 0;
        for (let i = 0; i < rows.length; i++) {
          const cellValue = String(rows[i]?.[1] || "").toLowerCase();
          if (cellValue.includes("roll") || cellValue.includes("अनुक्रमांक")) {
            startRow = i + 1;
            break;
          }
        }

        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2) continue; // Skip completely empty rows

          const rollNumber = String(row[1] || "").trim();

          // Stop parsing if we hit aggregate totals or empty roll numbers
          if (rollNumber === "" || rollNumber.toLowerCase().includes("total"))
            continue;

          // FIX FOR DOUBLE COUNTING (54 instead of 27)
          // If the sheet mirrors the data below for calculations, skip the duplicate roll numbers
          if (seenRolls.has(rollNumber)) continue;
          seenRolls.add(rollNumber);

          const marks: SubjectMarks[] = [];
          let slot = 1;

          // Parse Subject Codes (Cols 14 to 19 -> Indexes 13 to 18)
          for (let col = 13; col <= 18; col++) {
            const subCode = parseInt(row[col]);
            if (!isNaN(subCode)) {
              // FIX FOR QUARTERLY AND HALF YEARLY MARKS
              // Calculate exact column indices based on the blueprint offsets
              const qThIdx = 19 + (slot - 1) * 2;
              const qPrIdx = qThIdx + 1;

              const hyThIdx = 31 + (slot - 1) * 2;
              const hyPrIdx = hyThIdx + 1;

              const anThIdx = 43 + (slot - 1) * 2;
              const anPrIdx = anThIdx + 1;

              const qThData = parseMark(row[qThIdx]);
              const qPrData = parseMark(row[qPrIdx]);

              const hyThData = parseMark(row[hyThIdx]);
              const hyPrData = parseMark(row[hyPrIdx]);

              const anThData = parseMark(row[anThIdx]);
              const anPrData = parseMark(row[anPrIdx]);

              marks.push({
                slot,
                subjectCode: subCode,
                quarterly: {
                  th: qThData.mark,
                  pr: qPrData.mark,
                  isAbsent: qThData.isAbsent || qPrData.isAbsent,
                },
                halfYearly: {
                  th: hyThData.mark,
                  pr: hyPrData.mark,
                  isAbsent: hyThData.isAbsent || hyPrData.isAbsent,
                },
                annual: {
                  th: anThData.mark,
                  pr: anPrData.mark,
                  isAbsent: anThData.isAbsent || anPrData.isAbsent,
                },
                graceMarks: 0,
              });
              slot++;
            }
          }

          let student: Student = {
            id: crypto.randomUUID(),
            sessionId,
            rollNumber,
            name: String(row[2] || "").trim(),
            fatherName: String(row[3] || "").trim(),
            motherName: String(row[4] || "").trim(),
            category: String(row[5] || "GEN").toUpperCase() as Category,
            gender: String(row[6] || "M")
              .toUpperCase()
              .charAt(0) as Gender,
            dob: parseExcelDate(row[7]),
            scholarNumber: String(row[8] || "").trim(),
            sssmid: String(row[9] || "").trim(),
            enrolmentNumber: String(row[10] || "").trim(),
            medium: String(row[11] || "Hindi").trim(),
            section: String(row[12] || "").trim(),
            marks,
            isLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Compute result immediately on import so Dashboards/Merit lists are accurate
          if (marks.length > 0) {
            student.computed = computeStudent(student, subjectMap, classCfg);
          }

          students.push(student);
        }
        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
