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
import { UploadCloud, Loader2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassId, Stream, Session } from "@/types";

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
  const [stream, setStream] = useState<Stream>("NA");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsStream = classId === "11" || classId === "12";
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
        stream: needsStream ? stream : "NA",
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
          "sm:max-w-md ",
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

        <div className="space-y-4 py-4">
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

          {needsStream && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Stream</label>
              <Select
                value={stream}
                onValueChange={(v) => setStream(v as Stream)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Upload Excel Data Sheet (.xlsb, .xlsx)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
              <Input
                type="file"
                accept=".xlsx, .xlsb, .xls"
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
                  {file ? file.name : "Click to select Excel file"}
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
