"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ResultsShell } from "./_components/results-shell";

export default function ResultsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}
      >
        <ResultsShell />
      </Suspense>
    </AppShell>
  );
}
