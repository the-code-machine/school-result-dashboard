"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings";
import { toast } from "@/hooks/use-toast";
import type { Session } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Lock,
  Unlock,
  Trash2,
  GraduationCap,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  BookOpen,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const CLASS_COLORS: Record<string, string> = {
  "9": "border-l-blue-500",
  "10": "border-l-violet-500",
  "11": "border-l-emerald-500",
  "12": "border-l-amber-500",
};

const STREAM_BADGE: Record<string, string> = {
  Science: "bg-blue-100 text-blue-800",
  Commerce: "bg-emerald-100 text-emerald-800",
  Arts: "bg-pink-100 text-pink-800",
  NA: "bg-gray-100 text-gray-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  session: Session;
}

export function SessionCard({ session }: Props) {
  const { lockSession, updateSession, classConfigs, deleteSession } =
    useSettingsStore();

  const [expanded, setExpanded] = useState(false);

  const cfg = classConfigs[session.classId];

  const handleLock = () => {
    lockSession(session.id, "Admin");
    toast({
      variant: "success",
      title: "Session Locked",
      description: "Marks can no longer be edited. Results are finalised.",
    });
  };

  const handleUnlock = () => {
    updateSession(session.id, {
      isLocked: false,
      lockedAt: undefined,
      lockedBy: undefined,
    });
    toast({
      title: "Session Unlocked",
      description: "Marks entry is now open again.",
    });
  };

  const handleDelete = () => {
    deleteSession(session.id);
    toast({
      title: "Deleted",
      description: `Class ${session.classId} · ${session.year} session removed.`,
    });
  };

  return (
    <Card
      className={`border-l-4 ${CLASS_COLORS[session.classId] ?? "border-l-gray-300"} transition-shadow hover:shadow-md`}
    >
      <CardContent className="p-0">
        {/* Main row */}
        <div className="flex items-center gap-4 p-4">
          {/* Class icon */}
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-bold text-gray-900">
                Class {session.classId}th
                {session.section ? ` — Section ${session.section}` : ""}
              </p>

              {/* Stream badge */}
              {session.stream && session.stream !== "NA" && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STREAM_BADGE[session.stream]}`}
                >
                  {session.stream}
                </span>
              )}

              {/* Status badge */}
              {session.isLocked ? (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Lock className="w-2.5 h-2.5" />
                  Locked
                </Badge>
              ) : (
                <Badge variant="success" className="gap-1 text-xs">
                  <Unlock className="w-2.5 h-2.5" />
                  Active
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {session.year}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <BookOpen className="w-3 h-3" />
                {cfg.totalSubjects} subjects · best of {cfg.bestOfCount}
              </span>
              <span className="text-xs text-gray-400">
                Created {formatDate(session.createdAt)}
              </span>
            </div>

            {session.isLocked && session.lockedAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                Locked on {formatDate(session.lockedAt)}
                {session.lockedBy ? ` by ${session.lockedBy}` : ""}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded actions */}
        {expanded && (
          <>
            <Separator />
            <div className="p-4 bg-gray-50 rounded-b-xl space-y-4">
              {/* Quick nav links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link
                  href={`/students?session=${session.id}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">Students</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                </Link>
                <Link
                  href={`/marks?session=${session.id}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">Enter Marks</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                </Link>
                <Link
                  href={`/results?session=${session.id}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">View Results</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                </Link>
              </div>

              <Separator />

              {/* Config summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ["Max Marks", cfg.totalMaxMarks],
                  ["Denominator", cfg.percentageDenominator],
                  ["Pass %", `${cfg.passPercentage}%`],
                  ["Suppl. limit", `≤${cfg.maxFailForSuppl} fails`],
                ].map(([k, v]) => (
                  <div
                    key={String(k)}
                    className="rounded-lg border border-gray-200 bg-white p-2.5"
                  >
                    <p className="text-xs text-gray-500">{k}</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {v}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Danger zone */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Lock / Unlock */}
                {session.isLocked ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Unlock className="w-3.5 h-3.5" />
                        Unlock Session
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unlock Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will allow marks to be edited again. Results will
                          be recalculated on save.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnlock}>
                          Yes, Unlock
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="warning" size="sm" className="gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Lock Session
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Lock Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Locking will prevent any further mark edits. This is
                          typically done after result finalisation. You can
                          unlock later if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-amber-500 hover:bg-amber-600"
                          onClick={handleLock}
                        >
                          Yes, Lock Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Session
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the session for{" "}
                        <strong>
                          Class {session.classId} · {session.year}
                        </strong>
                        . All student marks linked to this session will also be
                        removed. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDelete}
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
