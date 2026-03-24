"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { MarksShell } from "./_components/marks-shell";

function MarksContent() {
  const params = useSearchParams();
  const studentId = params.get("student") ?? "";
  const sessionId = params.get("session") ?? "";

  return <MarksShell studentId={studentId} sessionId={sessionId} />;
}

export default function MarksPage() {
  return (
    <AppShell>
      <Suspense
        fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}
      >
        <MarksContent />
      </Suspense>
    </AppShell>
  );
}
