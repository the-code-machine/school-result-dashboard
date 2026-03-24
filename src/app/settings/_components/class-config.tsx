"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings";
import { DEFAULT_CLASS_CONFIGS } from "@/lib/defaults";
import { toast } from "@/hooks/use-toast";
import type { ClassConfig as ClassConfigType, ClassId } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Save, Info, ChevronDown, ChevronUp } from "lucide-react";

const CLASS_IDS: ClassId[] = ["9", "10", "11", "12"];

const CLASS_INFO: Record<ClassId, { color: string; note: string }> = {
  "9": {
    color: "bg-blue-50 border-blue-200",
    note: "Best-of-6 subjects. Denominator /500. No board exam.",
  },
  "10": {
    color: "bg-violet-50 border-violet-200",
    note: "Board exam class. Denominator /600.",
  },
  "11": {
    color: "bg-emerald-50 border-emerald-200",
    note: "5 subjects. Stream-based (Science/Commerce/Arts).",
  },
  "12": {
    color: "bg-amber-50 border-amber-200",
    note: "Board exam. 5 subjects. Stream-based.",
  },
};

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: NumberInputProps) {
  return (
    <Input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      className="h-8 text-sm"
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) onChange(v);
      }}
    />
  );
}

interface ClassCardProps {
  classId: ClassId;
}

function ClassCard({ classId }: ClassCardProps) {
  const { classConfigs, setClassConfig, resetClassConfig } = useSettingsStore();
  const cfg = classConfigs[classId] as ClassConfigType;
  const def = DEFAULT_CLASS_CONFIGS[classId];
  const info = CLASS_INFO[classId];

  const [open, setOpen] = useState(classId === "9");
  const [local, setLocal] = useState<ClassConfigType>(cfg);
  const isDirty = JSON.stringify(local) !== JSON.stringify(cfg);

  const set = (patch: Partial<ClassConfigType>) =>
    setLocal((prev) => ({ ...prev, ...patch }));

  const handleSave = () => {
    setClassConfig(classId, local);
    toast({
      variant: "success",
      title: "Saved",
      description: `Class ${classId} config updated.`,
    });
  };

  const handleReset = () => {
    setLocal(def);
    resetClassConfig(classId);
    toast({
      title: "Reset",
      description: `Class ${classId} reset to defaults.`,
    });
  };

  const toggleExam = (type: string) => {
    set({
      exams: local.exams.map((e) =>
        e.type === type ? { ...e, enabled: !e.enabled } : e,
      ),
    });
  };

  return (
    <Card className={`border ${info.color}`}>
      {/* Header — always visible */}
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Class {classId}th</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {local.totalSubjects} subjects
              </Badge>
              {isDirty && (
                <Badge variant="warning" className="text-xs">
                  Unsaved
                </Badge>
              )}
            </div>
            {open ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <CardDescription className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            {info.note}
          </CardDescription>
        </CardHeader>
      </button>

      {/* Body — collapsible */}
      {open && (
        <CardContent className="space-y-6 pt-0">
          <Separator />

          {/* Subject counts */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Subject Configuration
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Total Subjects" hint="Counted in result">
                <NumberInput
                  value={local.totalSubjects}
                  min={1}
                  max={8}
                  onChange={(v) => set({ totalSubjects: v })}
                />
              </Field>
              <Field label="Max Slots" hint="Including optional">
                <NumberInput
                  value={local.maxSubjectSlots}
                  min={1}
                  max={10}
                  onChange={(v) => set({ maxSubjectSlots: v })}
                />
              </Field>
              <Field label="Best-of Count" hint="Top N subjects summed">
                <NumberInput
                  value={local.bestOfCount}
                  min={1}
                  max={8}
                  onChange={(v) => set({ bestOfCount: v })}
                />
              </Field>
              <Field label="Total Max Marks" hint="e.g. 600 or 500">
                <NumberInput
                  value={local.totalMaxMarks}
                  min={100}
                  onChange={(v) => set({ totalMaxMarks: v })}
                />
              </Field>
            </div>
          </div>

          <Separator />

          {/* Percentage & Pass rules */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Percentage & Pass Rules
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="% Denominator" hint="Divide total by this">
                <NumberInput
                  value={local.percentageDenominator}
                  min={100}
                  onChange={(v) => set({ percentageDenominator: v })}
                />
              </Field>
              <Field label="Pass %" hint="Min to pass">
                <NumberInput
                  value={local.passPercentage}
                  min={1}
                  max={100}
                  onChange={(v) => set({ passPercentage: v })}
                />
              </Field>
              <Field label="Fail Threshold %" hint="Below this = E2 grade">
                <NumberInput
                  value={local.failThreshold}
                  min={0}
                  max={50}
                  onChange={(v) => set({ failThreshold: v })}
                />
              </Field>
              <Field
                label="Max Fail for Suppl."
                hint="Subjects allowed for compartment"
              >
                <NumberInput
                  value={local.maxFailForSuppl}
                  min={0}
                  max={5}
                  onChange={(v) => set({ maxFailForSuppl: v })}
                />
              </Field>
            </div>
          </div>

          <Separator />

          {/* Grace marks */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Grace Marks
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Allow Grace Marks
                  </p>
                  <p className="text-xs text-gray-500">
                    Principal can award grace
                  </p>
                </div>
                <Switch
                  checked={local.allowGraceMarks}
                  onCheckedChange={(v) => set({ allowGraceMarks: v })}
                />
              </div>
              <Field label="Max Grace / Subject" hint="Marks per subject">
                <NumberInput
                  value={local.maxGracePerSubject}
                  min={0}
                  max={10}
                  onChange={(v) => set({ maxGracePerSubject: v })}
                />
              </Field>
              <Field label="Max Subjects" hint="Subjects eligible">
                <NumberInput
                  value={local.maxGraceSubjects}
                  min={0}
                  max={6}
                  onChange={(v) => set({ maxGraceSubjects: v })}
                />
              </Field>
            </div>
          </div>

          <Separator />

          {/* Exams enabled */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Exam Types
            </p>
            <div className="flex flex-wrap gap-3">
              {local.exams.map((exam) => (
                <div
                  key={exam.type}
                  className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 min-w-[180px]"
                >
                  <Switch
                    checked={exam.enabled}
                    onCheckedChange={() => toggleExam(exam.type)}
                    id={`exam-${classId}-${exam.type}`}
                  />
                  <label
                    htmlFor={`exam-${classId}-${exam.type}`}
                    className="cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {exam.label}
                    </p>
                    <p className="text-xs text-gray-500">{exam.labelHindi}</p>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-500 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Default
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isDirty}
              onClick={handleSave}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Class {classId}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function ClassConfig() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Each class has independent marking rules. Changes here affect how
          totals, percentages, grades and results are calculated for that class.
          Click a class card to expand and edit.
        </p>
      </div>
      {CLASS_IDS.map((id) => (
        <ClassCard key={id} classId={id} />
      ))}
    </div>
  );
}
