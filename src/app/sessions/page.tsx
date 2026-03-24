"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useSettingsStore } from "@/store/settings";
import { SessionCard } from "./_components/session-card";
import { CreateSessionDialog } from "./_components/create-session-dialog";
import { SessionStats } from "./_components/session-stats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, GraduationCap, Filter, FolderOpen } from "lucide-react";

export default function SessionsPage() {
  const { sessions } = useSettingsStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = sessions.filter((s) => {
    const matchClass = filterClass === "all" || s.classId === filterClass;
    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "locked"
          ? s.isLocked
          : filterStatus === "active"
            ? !s.isLocked
            : true;
    return matchClass && matchStatus;
  });

  const activeCount = sessions.filter((s) => !s.isLocked).length;
  const lockedCount = sessions.filter((s) => s.isLocked).length;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Exam Sessions</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {sessions.length} total ·{" "}
              <span className="text-emerald-600 font-medium">
                {activeCount} active
              </span>{" "}
              · <span className="text-gray-400">{lockedCount} locked</span>
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        </div>

        {/* Stats */}
        {sessions.length > 0 && <SessionStats sessions={sessions} />}

        {/* Filters */}
        {sessions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="9">Class 9</SelectItem>
                <SelectItem value="10">Class 10</SelectItem>
                <SelectItem value="11">Class 11</SelectItem>
                <SelectItem value="12">Class 12</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>

            {(filterClass !== "all" || filterStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-500"
                onClick={() => {
                  setFilterClass("all");
                  setFilterStatus("all");
                }}
              >
                Clear filters
              </Button>
            )}

            <span className="text-xs text-gray-400 ml-auto">
              {filtered.length} shown
            </span>
          </div>
        )}

        {/* Session list */}
        {filtered.length === 0 ? (
          <EmptyState onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
          </div>
        )}
      </div>

      <CreateSessionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </AppShell>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <GraduationCap className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        No sessions yet
      </h3>
      <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
        Create your first exam session to start entering marks for a class.
      </p>
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="w-4 h-4" />
        Create First Session
      </Button>
    </div>
  );
}
