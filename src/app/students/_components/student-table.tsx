"use client";

import { useState } from "react";
import { useStudentsStore } from "@/store/students";
import { toast } from "@/hooks/use-toast";
import type { Student } from "@/types";
import { StudentDialog } from "./student-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, BookOpen, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

const RESULT_BADGE: Record<string, string> = {
  PASS: "bg-emerald-100 text-emerald-800",
  FAIL: "bg-red-100 text-red-800",
  SUPPLEMENTARY: "bg-amber-100 text-amber-800",
  ABSENT: "bg-gray-100 text-gray-600",
  PENDING: "bg-blue-50 text-blue-600 border border-blue-200",
};

const RESULT_LABEL: Record<string, string> = {
  PASS: "Pass",
  FAIL: "Fail",
  SUPPLEMENTARY: "Suppl.",
  ABSENT: "Absent",
  PENDING: "Pending",
};

const CATEGORY_COLOR: Record<string, string> = {
  GEN: "bg-gray-100 text-gray-700",
  OBC: "bg-blue-100 text-blue-700",
  SC: "bg-violet-100 text-violet-700",
  ST: "bg-orange-100 text-orange-700",
};

interface Props {
  students: Student[];
  sessionId: string;
  isSessionLocked: boolean;
}

export function StudentTable({ students, sessionId, isSessionLocked }: Props) {
  const { deleteStudent, getBySession } = useStudentsStore();
  const allSessionStudents = getBySession(sessionId);

  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = (id: string, name: string) => {
    deleteStudent(id);
    toast({ title: "Deleted", description: `${name} removed.` });
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-14 text-center">
        <Users className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-600">No students found</p>
        <p className="text-xs text-gray-400 mt-1">
          Add students or adjust filters
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Roll</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell w-24">
              Category
            </TableHead>
            <TableHead className="hidden md:table-cell w-20">Gender</TableHead>
            <TableHead className="hidden md:table-cell w-28">
              Scholar No.
            </TableHead>
            <TableHead className="w-24 text-center">Result</TableHead>
            <TableHead className="w-20 text-center hidden sm:table-cell">
              Marks
            </TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.map((student) => {
            const result = student.computed?.result ?? "PENDING";
            const pct = student.computed?.percentage;
            const rank = student.computed?.rank;

            return (
              <TableRow key={student.id}>
                {/* Roll */}
                <TableCell className="font-mono font-semibold text-gray-700 text-sm">
                  {student.rollNumber}
                </TableCell>

                {/* Name */}
                <TableCell>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-400 leading-tight">
                      {student.fatherName}
                      {pct !== undefined && (
                        <span className="ml-2 font-medium text-gray-600">
                          {pct.toFixed(1)}%
                        </span>
                      )}
                      {rank && (
                        <span className="ml-1 text-violet-600 font-semibold">
                          #{rank}
                        </span>
                      )}
                    </p>
                    {/* Mobile category */}
                    <div className="flex gap-1 mt-0.5 sm:hidden">
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[student.category]}`}
                      >
                        {student.category}
                      </span>
                      <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600">
                        {student.gender === "M"
                          ? "Male"
                          : student.gender === "F"
                            ? "Female"
                            : "Other"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell className="hidden sm:table-cell">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLOR[student.category]}`}
                  >
                    {student.category}
                  </span>
                </TableCell>

                {/* Gender */}
                <TableCell className="hidden md:table-cell text-sm text-gray-600">
                  {student.gender === "M"
                    ? "Male"
                    : student.gender === "F"
                      ? "Female"
                      : "Other"}
                </TableCell>

                {/* Scholar */}
                <TableCell className="hidden md:table-cell font-mono text-xs text-gray-500">
                  {student.scholarNumber ?? "—"}
                </TableCell>

                {/* Result */}
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${RESULT_BADGE[result]}`}
                  >
                    {RESULT_LABEL[result]}
                  </span>
                </TableCell>

                {/* Marks entry count */}
                <TableCell className="text-center hidden sm:table-cell">
                  <span className="text-xs text-gray-500">
                    {student.marks.length} / 6
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Go to marks */}
                    <Link
                      href={`/marks?student=${student.id}&session=${sessionId}`}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-gray-400 hover:text-blue-600"
                        title="Enter Marks"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-gray-400 hover:text-blue-600"
                      disabled={isSessionLocked}
                      onClick={() => {
                        setEditTarget(student);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-gray-400 hover:text-red-600"
                          disabled={isSessionLocked}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove <strong>{student.name}</strong> (Roll{" "}
                            {student.rollNumber}) and all their marks? This
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() =>
                              handleDelete(student.id, student.name)
                            }
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit dialog */}
      {editTarget && (
        <StudentDialog
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditTarget(null);
          }}
          sessionId={sessionId}
          existingRolls={allSessionStudents.map((s) => s.rollNumber)}
          initial={editTarget}
        />
      )}
    </>
  );
}
