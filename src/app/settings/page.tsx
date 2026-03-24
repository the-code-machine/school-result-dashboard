"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { School, BookOpen, LayoutGrid, Star } from "lucide-react";
import { SchoolForm } from "./_components/school-form";
import { ClassConfig } from "./_components/class-config";
import { SubjectTable } from "./_components/subject-table";
import { GradeScale } from "./_components/grade-scale";
import { Suspense } from "react";

const TABS = [
  { value: "school", label: "School", icon: School },
  { value: "classes", label: "Classes", icon: LayoutGrid },
  { value: "subjects", label: "Subjects", icon: BookOpen },
  { value: "grades", label: "Grades", icon: Star },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") ?? "school";

  const handleTabChange = (val: string) => {
    router.replace(`/settings?tab=${val}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure school info, class rules, subject master and grading.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="school">
          <SchoolForm />
        </TabsContent>

        <TabsContent value="classes">
          <ClassConfig />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectTable />
        </TabsContent>

        <TabsContent value="grades">
          <GradeScale />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={<div className="p-4 text-sm text-gray-500">Loading...</div>}
      >
        <SettingsContent />
      </Suspense>
    </AppShell>
  );
}
