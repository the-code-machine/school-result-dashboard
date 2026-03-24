import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExportShell } from "./_components/export-shell";

export default function ExportsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}
      >
        <ExportShell />
      </Suspense>
    </AppShell>
  );
}
