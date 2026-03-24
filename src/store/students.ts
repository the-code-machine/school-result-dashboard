import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Student, SubjectMarks, Gender, Category } from "@/types";

interface StudentsStore {
  students: Student[];

  // CRUD
  addStudent: (s: Student) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkAdd: (students: Student[]) => void;

  // Marks
  saveMarks: (studentId: string, marks: SubjectMarks[]) => void;

  // Lock
  lockStudent: (id: string) => void;
  unlockStudent: (id: string) => void;

  // Query helpers
  getBySession: (sessionId: string) => Student[];
  getById: (id: string) => Student | undefined;

  // Clear all
  clearAll: () => void;
}

export const useStudentsStore = create<StudentsStore>()(
  persist(
    (set, get) => ({
      students: [],

      addStudent: (s) => set((state) => ({ students: [...state.students, s] })),

      updateStudent: (id, patch) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id
              ? { ...s, ...patch, updatedAt: new Date().toISOString() }
              : s,
          ),
        })),

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),

      bulkAdd: (students) =>
        set((state) => ({ students: [...state.students, ...students] })),

      saveMarks: (studentId, marks) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === studentId
              ? { ...s, marks, updatedAt: new Date().toISOString() }
              : s,
          ),
        })),

      lockStudent: (id) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, isLocked: true } : s,
          ),
        })),

      unlockStudent: (id) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, isLocked: false } : s,
          ),
        })),

      getBySession: (sessionId) =>
        get().students.filter((s) => s.sessionId === sessionId),

      getById: (id) => get().students.find((s) => s.id === id),

      clearAll: () => set({ students: [] }),
    }),
    { name: "school-result-students" },
  ),
);
