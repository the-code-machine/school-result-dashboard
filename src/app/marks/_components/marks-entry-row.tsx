"use client";

import { useState } from "react";
import type { SubjectMarks, SubjectRule, ClassConfig } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  marks: SubjectMarks;
  rule: SubjectRule;
  classCfg: ClassConfig;
  onChange: (updated: SubjectMarks) => void;
  disabled: boolean;
}

const EXAM_KEYS = ["quarterly", "halfYearly", "annual"] as const;

const EXAM_LABELS: Record<string, string> = {
  quarterly: "Quarterly",
  halfYearly: "Half-Yearly",
  annual: "Annual",
};

const EXAM_HINDI: Record<string, string> = {
  quarterly: "त्रैमासिक",
  halfYearly: "अर्धवार्षिक",
  annual: "वार्षिक",
};

interface MarkInputProps {
  value: number | null;
  max: number;
  pass: number;
  label: string;
  disabled: boolean;
  absent: boolean;
  onChange: (v: number | null) => void;
}

function MarkInput({
  value,
  max,
  pass,
  label,
  disabled,
  absent,
  onChange,
}: MarkInputProps) {
  const isInvalid = value !== null && !absent && (value < 0 || value > max);
  const isFail = value !== null && !absent && value < pass && value >= 0;

  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-gray-500">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min={0}
          max={max}
          value={value ?? ""}
          disabled={disabled || absent}
          placeholder={absent ? "AB" : "—"}
          className={cn(
            "h-8 text-sm text-center pr-8",
            isInvalid && "border-red-400 focus:ring-red-400",
            isFail && "border-amber-400 bg-amber-50",
            absent && "bg-gray-100 text-gray-400",
          )}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? null : Number(v));
          }}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
          /{max}
        </span>
      </div>
      {isInvalid && <p className="text-[10px] text-red-500">Max {max}</p>}
      {isFail && !isInvalid && (
        <p className="text-[10px] text-amber-600">Pass: {pass}</p>
      )}
    </div>
  );
}

export function MarksEntryRow({
  marks,
  rule,
  classCfg,
  onChange,
  disabled,
}: Props) {
  const [expanded, setExpanded] = useState(true);

  const enabledExams = classCfg.exams
    .filter((e) => e.enabled)
    .map((e) => e.type.toLowerCase());

  const updateAnnual = (
    field: "th" | "pr" | "isAbsent",
    value: number | null | boolean,
  ) => {
    onChange({
      ...marks,
      annual: { ...marks.annual, [field]: value },
    });
  };

  const updatePeriodic = (
    examKey: "quarterly" | "halfYearly",
    field: "th" | "pr" | "isAbsent",
    value: number | null | boolean,
  ) => {
    const existing = marks[examKey] ?? {
      th: null,
      pr: null,
      isAbsent: false,
    };
    onChange({
      ...marks,
      [examKey]: { ...existing, [field]: value },
    });
  };

  const updateGrace = (value: number) => {
    if (!classCfg.allowGraceMarks) return;
    const clamped = Math.min(value, classCfg.maxGracePerSubject);
    onChange({ ...marks, graceMarks: clamped });
  };

  // live annual total
  const annualTotal = marks.annual.isAbsent
    ? "AB"
    : (marks.annual.th ?? 0) + (marks.annual.pr ?? 0) + marks.graceMarks;

  const annualMax = rule.thMax + rule.prMax;
  const isPassing =
    !marks.annual.isAbsent &&
    (marks.annual.th ?? 0) + (marks.graceMarks ?? 0) >= rule.thPass &&
    (marks.annual.pr ?? 0) >= rule.prPass;

  return (
    <Card
      className={cn(
        "border",
        marks.annual.isAbsent && "border-gray-200 opacity-70",
        !marks.annual.isAbsent && isPassing && "border-emerald-200",
        !marks.annual.isAbsent &&
          !isPassing &&
          marks.annual.th !== null &&
          "border-amber-200",
      )}
    >
      <CardContent className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-2 text-left"
            >
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                {marks.slot}
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">{rule.name}</p>
                <p className="text-[10px] text-gray-500">
                  Code {rule.code} · TH {rule.thMax}/{rule.thPass} · PR{" "}
                  {rule.prMax}/{rule.prPass}
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Annual total badge */}
            <div
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-bold",
                marks.annual.isAbsent
                  ? "bg-gray-100 text-gray-500"
                  : isPassing
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-700",
              )}
            >
              <span>{annualTotal}</span>
              <span className="text-xs font-normal opacity-60">
                /{annualMax}
              </span>
            </div>

            {/* Absent toggle */}
            <div className="flex items-center gap-1.5">
              <Switch
                id={`absent-${marks.slot}`}
                checked={marks.annual.isAbsent}
                onCheckedChange={(v) => updateAnnual("isAbsent", v)}
                disabled={disabled}
              />
              <label
                htmlFor={`absent-${marks.slot}`}
                className="text-xs text-gray-500 cursor-pointer"
              >
                Absent
              </label>
            </div>
          </div>
        </div>

        {/* Annual marks */}
        {expanded && (
          <div className="space-y-3 pt-1">
            {/* Annual TH + PR */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                Annual Exam
                <span className="text-gray-400 font-normal">
                  वार्षिक परीक्षा
                </span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {rule.hasTheory && (
                  <MarkInput
                    label={`Theory (max ${rule.thMax})`}
                    value={marks.annual.th}
                    max={rule.thMax}
                    pass={rule.thPass}
                    disabled={disabled}
                    absent={marks.annual.isAbsent}
                    onChange={(v) => updateAnnual("th", v)}
                  />
                )}
                {rule.hasPractical && (
                  <MarkInput
                    label={`Practical (max ${rule.prMax})`}
                    value={marks.annual.pr}
                    max={rule.prMax}
                    pass={rule.prPass}
                    disabled={disabled}
                    absent={marks.annual.isAbsent}
                    onChange={(v) => updateAnnual("pr", v)}
                  />
                )}

                {/* Grace marks */}
                {classCfg.allowGraceMarks && !marks.annual.isAbsent && (
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-500">
                      Grace (max {classCfg.maxGracePerSubject})
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={classCfg.maxGracePerSubject}
                      value={marks.graceMarks || ""}
                      disabled={disabled}
                      placeholder="0"
                      className="h-8 text-sm text-center"
                      onChange={(e) => updateGrace(Number(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quarterly */}
            {enabledExams.includes("quarterly") && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Quarterly · {EXAM_HINDI["quarterly"]}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {rule.hasTheory && (
                    <MarkInput
                      label={`Theory (max ${rule.thMax})`}
                      value={marks.quarterly?.th ?? null}
                      max={rule.thMax}
                      pass={rule.thPass}
                      disabled={disabled}
                      absent={marks.quarterly?.isAbsent ?? false}
                      onChange={(v) => updatePeriodic("quarterly", "th", v)}
                    />
                  )}
                  {rule.hasPractical && (
                    <MarkInput
                      label={`Practical (max ${rule.prMax})`}
                      value={marks.quarterly?.pr ?? null}
                      max={rule.prMax}
                      pass={rule.prPass}
                      disabled={disabled}
                      absent={marks.quarterly?.isAbsent ?? false}
                      onChange={(v) => updatePeriodic("quarterly", "pr", v)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Half-Yearly */}
            {enabledExams.includes("halfyearly") && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Half-Yearly · {EXAM_HINDI["halfYearly"]}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {rule.hasTheory && (
                    <MarkInput
                      label={`Theory (max ${rule.thMax})`}
                      value={marks.halfYearly?.th ?? null}
                      max={rule.thMax}
                      pass={rule.thPass}
                      disabled={disabled}
                      absent={marks.halfYearly?.isAbsent ?? false}
                      onChange={(v) => updatePeriodic("halfYearly", "th", v)}
                    />
                  )}
                  {rule.hasPractical && (
                    <MarkInput
                      label={`Practical (max ${rule.prMax})`}
                      value={marks.halfYearly?.pr ?? null}
                      max={rule.prMax}
                      pass={rule.prPass}
                      disabled={disabled}
                      absent={marks.halfYearly?.isAbsent ?? false}
                      onChange={(v) => updatePeriodic("halfYearly", "pr", v)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
