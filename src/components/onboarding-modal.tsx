"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settings";
import { useStudentsStore } from "@/store/students";
import { useUIStore } from "@/store/ui";
import { parseExcelToStudents } from "@/lib/excel-parser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UploadCloud,
  Loader2,
  GraduationCap,
  Info,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassId, Session } from "@/types";

export function OnboardingModal() {
  const pathname = usePathname();
  const { sessions, addSession } = useSettingsStore();
  const { bulkAdd } = useStudentsStore();
  const { importModalOpen, setImportModalOpen } = useUIStore();

  const [mounted, setMounted] = useState(false);

  // Auto-open logic: Only if 0 sessions AND we are NOT on a print page
  useEffect(() => {
    setMounted(true);
    if (sessions.length === 0 && !pathname.startsWith("/print")) {
      setImportModalOpen(true);
    }
  }, [sessions.length, pathname, setImportModalOpen]);

  const [year, setYear] = useState("2024-25");
  const [classId, setClassId] = useState<ClassId>("9");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isForcedOnboarding = sessions.length === 0;

  const handleImport = async () => {
    if (!file) {
      setError("Please select an Excel file.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const sessionId = crypto.randomUUID();

      const importedStudents = await parseExcelToStudents(
        file,
        sessionId,
        classId,
      );

      if (importedStudents.length === 0) {
        throw new Error("Could not find any valid student rows in the file.");
      }

      const newSession: Session = {
        id: sessionId,
        year,
        classId,
        stream: "NA", // Default to NA since subjects define the stream per student
        isLocked: false,
        createdAt: new Date().toISOString(),
      };

      addSession(newSession);
      bulkAdd(importedStudents);

      setImportModalOpen(false);
      setFile(null); // reset file for next time
    } catch (err: any) {
      setError(err.message || "Failed to parse the Excel file.");
    } finally {
      setLoading(false);
    }
  };

  // Generate and download a dummy template CSV
  const downloadTemplate = () => {
    const headers = [
      "S.No.",
      "Roll Number",
      "Student Name",
      "Father's Name",
      "Mother's Name",
      "CWSN",
      "Category",
      "Gender",
      "DOB",
      "Scholar Number",
      "SSSMID",
      "Enrolment Number",
      "Medium",
      "Section",
      "Sub1 Code",
      "Sub2 Code",
      "Sub3 Code",
      "Sub4 Code",
      "Sub5 Code",
      "Sub6 Code",
      "Q1_TH",
      "Q1_PR",
      "Q2_TH",
      "Q2_PR",
      "Q3_TH",
      "Q3_PR",
      "Q4_TH",
      "Q4_PR",
      "Q5_TH",
      "Q5_PR",
      "Q6_TH",
      "Q6_PR",
      "HY1_TH",
      "HY1_PR",
      "HY2_TH",
      "HY2_PR",
      "HY3_TH",
      "HY3_PR",
      "HY4_TH",
      "HY4_PR",
      "HY5_TH",
      "HY5_PR",
      "HY6_TH",
      "HY6_PR",
      "AN1_TH",
      "AN1_PR",
      "AN2_TH",
      "AN2_PR",
      "AN3_TH",
      "AN3_PR",
      "AN4_TH",
      "AN4_PR",
      "AN5_TH",
      "AN5_PR",
      "AN6_TH",
      "AN6_PR",
    ].join(",");

    // Row 1: Example for 9th/10th (6 Subjects)
    const row9 =
      "1,901,Amit Kumar,Rajesh Kumar,Sunita Devi,No,GEN,M,2010-05-15,1001,123456789,EN123,Hindi,A,401,411,512,100,200,300,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10,50,10";

    // Row 2: Example for 11th/12th (5 Subjects - Sub6 is blank)
    const row11 =
      "2,1101,Neha Sharma,Anil Sharma,Priya Sharma,No,GEN,F,2008-08-20,2001,987654321,EN987,English,A,52,51,120,110,140,,60,15,60,15,60,15,60,15,60,15,,,60,15,60,15,60,15,60,15,60,15,,,60,15,60,15,60,15,60,15,60,15,,";

    const csvContent = "\uFEFF" + [headers, row9, row11].join("\n"); // \uFEFF ensures Excel reads UTF-8 correctly
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "MPBSE_DATA_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  return (
    <Dialog
      open={importModalOpen}
      onOpenChange={(o) => {
        // Only allow closing if it's NOT the forced initial onboarding
        if (!isForcedOnboarding) {
          setImportModalOpen(o);
        }
      }}
    >
      <DialogContent
        className={cn(
          "sm:max-w-lg ", // Slightly wider to fit guidelines nicely
          isForcedOnboarding && "[&>button]:hidden", // Hides the 'X' close button if forced
        )}
      >
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <GraduationCap className="w-6 h-6 text-blue-700" />
          </div>
          <DialogTitle className="text-center text-xl">
            {isForcedOnboarding
              ? "Welcome to Result Manager"
              : "Import Excel Session"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isForcedOnboarding
              ? 'Let\'s get started by importing your existing MPBSE "DATA Sheet" Excel file.'
              : 'Upload another "DATA Sheet" to instantly create a new session and bulk-import its students.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Guidelines Box */}
          <div className="bg-blue-50 p-3.5 rounded-lg border border-blue-100 text-xs text-blue-900 space-y-2 shadow-sm">
            <p className="font-bold flex items-center gap-1.5 text-blue-700">
              <Info className="w-4 h-4" /> Formatting Guidelines
            </p>
            <ul className="list-disc pl-5 space-y-1 opacity-90">
              <li>
                Sheet name must contain the word <strong>DATA</strong>.
              </li>
              <li>
                Data rows must begin right after the header containing the word{" "}
                <strong>Roll</strong>.
              </li>
              <li>
                For Class 11/12 (5 subjects), leave the 6th subject code column
                entirely blank.
              </li>
              <li>
                Mark Absentees with <strong>A</strong> or <strong>ABS</strong>{" "}
                in the marks cell.
              </li>
            </ul>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-700 font-bold hover:text-blue-800 gap-1.5 mt-1"
              onClick={downloadTemplate}
            >
              <Download className="w-3.5 h-3.5" />
              Download Dummy Template (CSV)
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Year</label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select
                value={classId}
                onValueChange={(v) => setClassId(v as ClassId)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Class 9th</SelectItem>
                  <SelectItem value="10">Class 10th</SelectItem>
                  <SelectItem value="11">Class 11th</SelectItem>
                  <SelectItem value="12">Class 12th</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Upload Excel Data Sheet (.xlsb, .xlsx, .csv)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer">
              <Input
                type="file"
                accept=".xlsx, .xlsb, .xls, .csv"
                className="hidden"
                id="file-upload"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  {file ? file.name : "Click to select Excel/CSV file"}
                </span>
              </label>
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              "Import Data"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
