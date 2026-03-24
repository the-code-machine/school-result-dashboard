import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SchoolConfig, ClassConfig, SubjectRule, Session } from "@/types";
import { DEFAULT_CLASS_CONFIGS, DEFAULT_SUBJECTS } from "@/lib/defaults";

interface SettingsStore {
  school: SchoolConfig;
  setSchool: (s: Partial<SchoolConfig>) => void;

  classConfigs: Record<string, ClassConfig>;
  setClassConfig: (classId: string, config: Partial<ClassConfig>) => void;
  resetClassConfig: (classId: string) => void;

  subjects: SubjectRule[];
  addSubject: (s: SubjectRule) => void;
  updateSubject: (code: number, s: Partial<SubjectRule>) => void;
  deleteSubject: (code: number) => void;
  resetSubjects: () => void;

  sessions: Session[];
  addSession: (s: Session) => void;
  updateSession: (id: string, s: Partial<Session>) => void;
  lockSession: (id: string, lockedBy: string) => void;

  // Add to interface
  deleteSession: (id: string) => void;

  deleteBySession: (sessionId: string) => void; // <--- NEW

  // Add to implementation (inside the persist block)
}

const DEFAULT_SCHOOL: SchoolConfig = {
  id: "school-1",
  diseCode: "23310300104",
  mpbseCode: "622055",
  name: "Nehru Memorial Higher Secondary School",
  nameHindi: "नेहरू स्मारक उच्चतर माध्यमिक विद्यालय",
  principal: "",
  address: "Kurwai",
  block: "Kurwai",
  district: "Vidisha",
  state: "Madhya Pradesh",
  logoUrl: "/logo.png",
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      school: DEFAULT_SCHOOL,
      setSchool: (s) => set((state) => ({ school: { ...state.school, ...s } })),

      classConfigs: { ...DEFAULT_CLASS_CONFIGS },
      setClassConfig: (classId, config) =>
        set((state) => ({
          classConfigs: {
            ...state.classConfigs,
            [classId]: { ...state.classConfigs[classId], ...config },
          },
        })),
      resetClassConfig: (classId) =>
        set((state) => ({
          classConfigs: {
            ...state.classConfigs,
            [classId]: DEFAULT_CLASS_CONFIGS[classId],
          },
        })),

      subjects: DEFAULT_SUBJECTS,
      addSubject: (s) => set((state) => ({ subjects: [...state.subjects, s] })),
      updateSubject: (code, s) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.code === code ? { ...sub, ...s } : sub,
          ),
        })),
      deleteSubject: (code) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.code !== code),
        })),
      resetSubjects: () => set({ subjects: DEFAULT_SUBJECTS }),

      sessions: [],
      addSession: (s) => set((state) => ({ sessions: [...state.sessions, s] })),
      updateSession: (id, s) =>
        set((state) => ({
          sessions: state.sessions.map((sess) =>
            sess.id === id ? { ...sess, ...s } : sess,
          ),
        })),
      lockSession: (id, lockedBy) =>
        set((state) => ({
          sessions: state.sessions.map((sess) =>
            sess.id === id
              ? {
                  ...sess,
                  isLocked: true,
                  lockedAt: new Date().toISOString(),
                  lockedBy,
                }
              : sess,
          ),
        })),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),

      deleteBySession: (sessionId) =>
        set((state) => ({
          students: state.students.filter((s) => s.sessionId !== sessionId),
        })),
    }),
    { name: "school-result-settings" },
  ),
);
