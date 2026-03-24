"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings";
import { MPBSE_GRADE_SCALE } from "@/lib/defaults";
import { toast } from "@/hooks/use-toast";
import type { ClassId, GradeRule, DivisionRule } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, RotateCcw, Info } from "lucide-react";

const CLASS_IDS: ClassId[] = ["9", "10", "11", "12"];

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-800 border-emerald-200",
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-blue-100 text-blue-800 border-blue-200",
  C: "bg-cyan-100 text-cyan-800 border-cyan-200",
  D: "bg-amber-100 text-amber-800 border-amber-200",
  E1: "bg-orange-100 text-orange-800 border-orange-200",
  E2: "bg-red-100 text-red-800 border-red-200",
};

export function GradeScale() {
  const { classConfigs, setClassConfig } = useSettingsStore();
  const [selectedClass, setSelectedClass] = useState<ClassId>("9");

  const cfg = classConfigs[selectedClass];
  const scale = cfg.gradeScale;

  const [local, setLocal] = useState<GradeRule[]>(scale);
  const isDirty = JSON.stringify(local) !== JSON.stringify(scale);

  const updateRow = (
    idx: number,
    field: keyof GradeRule,
    value: string | number,
  ) => {
    setLocal((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  };

  const handleSave = () => {
    setClassConfig(selectedClass, { gradeScale: local });
    toast({
      variant: "success",
      title: "Saved",
      description: `Grade scale for Class ${selectedClass} updated.`,
    });
  };

  const handleReset = () => {
    setLocal(MPBSE_GRADE_SCALE);
    setClassConfig(selectedClass, { gradeScale: MPBSE_GRADE_SCALE });
    toast({
      title: "Reset",
      description: "Grade scale reset to MPBSE defaults.",
    });
  };

  // switch class
  const switchClass = (id: ClassId) => {
    setSelectedClass(id);
    setLocal(classConfigs[id].gradeScale);
  };

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Grade scale defines the letter grade (A+, A, B…) awarded based on
          percentage. Ranges must be consecutive and cover 0–100. Each class can
          have its own scale.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Grade Scale</CardTitle>
              <CardDescription>
                Percentage → Grade mapping per class
              </CardDescription>
            </div>
            <Select
              value={selectedClass}
              onValueChange={(v) => switchClass(v as ClassId)}
            >
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASS_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    Class {id}th
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Visual preview */}
          <div className="flex gap-1.5 flex-wrap">
            {local.map((r) => (
              <div
                key={r.grade}
                className={`flex flex-col items-center rounded-lg border px-3 py-2 min-w-[56px] ${GRADE_COLORS[r.grade] ?? "bg-gray-100"}`}
              >
                <span className="text-base font-bold">{r.grade}</span>
                <span className="text-[10px] font-medium">
                  {r.minPercent}%+
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Editable rows */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 px-1">
              <p className="col-span-2 text-xs font-semibold text-gray-500">
                Grade
              </p>
              <p className="col-span-3 text-xs font-semibold text-gray-500">
                Min %
              </p>
              <p className="col-span-3 text-xs font-semibold text-gray-500">
                Max %
              </p>
              <p className="col-span-4 text-xs font-semibold text-gray-500">
                Label
              </p>
            </div>

            {local.map((row, idx) => (
              <div
                key={row.grade}
                className="grid grid-cols-12 gap-2 items-center rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center justify-center w-9 h-7 rounded-md text-xs font-bold border ${GRADE_COLORS[row.grade] ?? "bg-gray-100"}`}
                  >
                    {row.grade}
                  </span>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={row.minPercent}
                    className="h-7 text-sm"
                    onChange={(e) =>
                      updateRow(idx, "minPercent", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={row.maxPercent}
                    className="h-7 text-sm"
                    onChange={(e) =>
                      updateRow(idx, "maxPercent", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    value={row.label}
                    className="h-7 text-sm"
                    onChange={(e) => updateRow(idx, "label", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-gray-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to MPBSE Default
            </Button>
            <Button
              size="sm"
              disabled={!isDirty}
              onClick={handleSave}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Grade Scale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
