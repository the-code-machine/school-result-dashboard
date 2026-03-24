"use client";

import type { StudentComputed, ClassConfig } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";

interface Props {
  computed?: StudentComputed;
  classCfg?: ClassConfig | null;
  studentName: string;
}

const RESULT_CONFIG = {
  PASS: {
    label: "PASS",
    labelHindi: "उत्तीर्ण",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  FAIL: {
    label: "FAIL",
    labelHindi: "अनुत्तीर्ण",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  SUPPLEMENTARY: {
    label: "SUPPL.",
    labelHindi: "पूरक",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  ABSENT: {
    label: "ABSENT",
    labelHindi: "अनुपस्थित",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    icon: MinusCircle,
    iconColor: "text-gray-400",
  },
  PENDING: {
    label: "PENDING",
    labelHindi: "प्रतीक्षारत",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: TrendingUp,
    iconColor: "text-blue-400",
  },
};

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-emerald-500",
  A: "bg-green-500",
  B: "bg-blue-500",
  C: "bg-cyan-500",
  D: "bg-amber-500",
  E1: "bg-orange-500",
  E2: "bg-red-500",
};

export function ResultPreview({ computed, classCfg, studentName }: Props) {
  if (!computed) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">
            Enter marks to see live result preview
          </p>
        </CardContent>
      </Card>
    );
  }

  const resultKey = computed.result ?? "PENDING";
  const cfg = RESULT_CONFIG[resultKey] ?? RESULT_CONFIG.PENDING;
  const Icon = cfg.icon;

  return (
    <div className="space-y-3">
      {/* Result card */}
      <Card className={`border ${cfg.bg}`}>
        <CardContent className="p-4 text-center space-y-1">
          <Icon className={`w-8 h-8 mx-auto ${cfg.iconColor}`} />
          <p className={`text-2xl font-black ${cfg.color}`}>{cfg.label}</p>
          <p className="text-sm text-gray-500">{cfg.labelHindi}</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-gray-500 uppercase tracking-widest">
            Result Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Grand Total</span>
            <span className="text-sm font-bold text-gray-900">
              {computed.grandTotal}
              <span className="text-xs font-normal text-gray-400">
                {" "}
                / {computed.maxMarks}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Percentage</span>
            <span className="text-sm font-bold text-gray-900">
              {computed.percentage.toFixed(2)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                computed.percentage >= (classCfg?.passPercentage ?? 33)
                  ? "bg-emerald-500"
                  : "bg-red-400"
              }`}
              style={{ width: `${Math.min(computed.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>0%</span>
            <span className="text-gray-600">
              Pass: {classCfg?.passPercentage ?? 33}%
            </span>
            <span>100%</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Grade</span>
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black text-white ${GRADE_COLORS[computed.grade] ?? "bg-gray-400"}`}
            >
              {computed.grade}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Division</span>
            <span className="text-sm font-semibold text-gray-800">
              {computed.division}
            </span>
          </div>

          {computed.rank && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Rank</span>
              <span className="text-sm font-bold text-violet-700">
                # {computed.rank}
              </span>
            </div>
          )}

          <Separator />

          {/* Subject breakdown */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Subject Totals
          </p>
          {computed.subjectTotals.map((sub) => (
            <div key={sub.slot} className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Slot {sub.slot}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">
                  {sub.total}
                  <span className="text-gray-400">/{sub.max}</span>
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    sub.isPassed ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {sub.grade}
                </span>
              </div>
            </div>
          ))}

          {computed.subjectsFailed > 0 && (
            <p className="text-xs text-amber-600 font-medium">
              ⚠ Failed in {computed.subjectsFailed} subject
              {computed.subjectsFailed > 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
