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

  if (typeof serial === "number") {
    const d = new Date((serial - 25569) * 86400000);
    return d.toISOString().split("T")[0];
  }
  if (serial instanceof Date) {
    return serial.toISOString().split("T")[0];
  }

  let strVal = String(serial).trim().replace(/^'/, "");
  const parts = strVal.split(/[-/]/);
  if (parts.length === 3) {
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }
    if (year.length === 4) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }
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

        const sheetName =
          workbook.SheetNames.find(
            (n) =>
              n.toLowerCase() === "data sheet" || n.toLowerCase() === "data",
          ) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        const students: Student[] = [];
        const seenRolls = new Set<string>();

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
          if (!row || row.length < 2) continue;

          const rollNumber = String(row[1] || "").trim();

          if (rollNumber === "" || rollNumber.toLowerCase().includes("total"))
            continue;

          if (seenRolls.has(rollNumber)) continue;
          seenRolls.add(rollNumber);

          const marks: SubjectMarks[] = [];
          let slot = 1;

          // EXACT COLUMN MAPPING BASED ON EXCEL RED NUMBERS
          // Subject Codes are in red columns 15 to 20 -> JS Array indices 14 to 19
          for (let col = 14; col <= 19; col++) {
            const subCode = parseInt(row[col]);

            // Only process if it's a valid subject code
            if (!isNaN(subCode) && subCode > 0) {
              // Quarterly Marks: Red Columns 21-32 -> JS Array indices 20-31
              const qThIdx = 20 + (slot - 1) * 2;
              const qPrIdx = qThIdx + 1;

              // Half-Yearly Marks: Red Columns 33-44 -> JS Array indices 32-43
              const hyThIdx = 32 + (slot - 1) * 2;
              const hyPrIdx = hyThIdx + 1;

              // Annual Marks: Red Columns 45-56 -> JS Array indices 44-55
              const anThIdx = 44 + (slot - 1) * 2;
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
            name: String(row[2] || "").trim(), // Red Col 3
            fatherName: String(row[3] || "").trim(), // Red Col 4
            motherName: String(row[4] || "").trim(), // Red Col 5
            // Note: row[5] is CWSN (Red Col 6), so Category is row[6]
            category: String(row[6] || "GEN").toUpperCase() as Category, // Red Col 7
            gender: String(row[7] || "M")
              .toUpperCase()
              .charAt(0) as Gender, // Red Col 8
            dob: parseExcelDate(row[8]), // Red Col 9
            scholarNumber: String(row[9] || "").trim(), // Red Col 10
            sssmid: String(row[10] || "").trim(), // Red Col 11
            enrolmentNumber: String(row[11] || "").trim(), // Red Col 12
            medium: String(row[12] || "Hindi").trim(), // Red Col 13
            section: String(row[13] || "").trim(), // Red Col 14
            marks,
            isLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Compute result immediately on import
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
