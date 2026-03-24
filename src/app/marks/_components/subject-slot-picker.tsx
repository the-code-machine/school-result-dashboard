"use client";

import type { SubjectMarks, SubjectRule } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface Props {
  slots: number;
  marks: SubjectMarks[];
  subjects: SubjectRule[];
  onSlotChange: (slot: number, code: number) => void;
  disabled: boolean;
}

const SLOT_LABELS = [
  "Language 1",
  "Language 2",
  "Language 3 / Optional",
  "Subject 1",
  "Subject 2",
  "Subject 3",
  "Subject 4 (Optional)",
];

const TYPE_COLORS: Record<string, string> = {
  language: "bg-violet-100 text-violet-700",
  core: "bg-blue-100 text-blue-700",
  vocational: "bg-amber-100 text-amber-700",
  arts: "bg-pink-100 text-pink-700",
};

export function SubjectSlotPicker({
  slots,
  marks,
  subjects,
  onSlotChange,
  disabled,
}: Props) {
  // group subjects by type for the dropdown
  const byType = {
    language: subjects.filter((s) => s.type === "language"),
    core: subjects.filter((s) => s.type === "core"),
    vocational: subjects.filter((s) => s.type === "vocational"),
    arts: subjects.filter((s) => s.type === "arts"),
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Subject Slots
          <Badge variant="secondary" className="text-xs ml-auto">
            {marks.length} / {slots} assigned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: slots }, (_, i) => {
            const slot = i + 1;
            const current = marks.find((m) => m.slot === slot);
            const rule = current
              ? subjects.find((s) => s.code === current.subjectCode)
              : undefined;

            return (
              <div key={slot} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {slot}
                </span>

                <div className="flex-1 min-w-0">
                  <Select
                    value={current ? String(current.subjectCode) : ""}
                    onValueChange={(v) => onSlotChange(slot, Number(v))}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue
                        placeholder={SLOT_LABELS[i] ?? `Slot ${slot}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Language */}
                      {byType.language.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Languages</SelectLabel>
                          {byType.language.map((s) => (
                            <SelectItem key={s.code} value={String(s.code)}>
                              {s.code} — {s.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {/* Core */}
                      {byType.core.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Core Subjects</SelectLabel>
                          {byType.core.map((s) => (
                            <SelectItem key={s.code} value={String(s.code)}>
                              {s.code} — {s.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {/* Vocational */}
                      {byType.vocational.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Vocational</SelectLabel>
                          {byType.vocational.map((s) => (
                            <SelectItem key={s.code} value={String(s.code)}>
                              {s.code} — {s.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {/* Arts */}
                      {byType.arts.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Arts / Music</SelectLabel>
                          {byType.arts.map((s) => (
                            <SelectItem key={s.code} value={String(s.code)}>
                              {s.code} — {s.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type badge */}
                {rule && (
                  <span
                    className={`hidden sm:inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold shrink-0 ${TYPE_COLORS[rule.type]}`}
                  >
                    {rule.thMax}/{rule.prMax}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
