"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SubjectRule, SubjectType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const schema = z
  .object({
    code: z.coerce.number().min(1, "Code required"),
    name: z.string().min(2, "Name required"),
    nameHindi: z.string().optional(),
    type: z.enum(["core", "language", "vocational", "arts"]),
    thMax: z.coerce.number().min(0),
    prMax: z.coerce.number().min(0),
    thPass: z.coerce.number().min(0),
    prPass: z.coerce.number().min(0),
    hasTheory: z.boolean(),
    hasPractical: z.boolean(),
  })
  .refine((d) => d.thMax + d.prMax > 0, {
    message: "Total max marks must be > 0",
    path: ["thMax"],
  })
  .refine((d) => d.thMax + d.prMax === 100, {
    message: "TH Max + PR Max must equal 100",
    path: ["prMax"],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (s: SubjectRule) => void;
  initial?: SubjectRule | null;
  existingCodes: number[];
}

const SUBJECT_TYPES: { value: SubjectType; label: string }[] = [
  { value: "language", label: "Language" },
  { value: "core", label: "Core" },
  { value: "vocational", label: "Vocational" },
  { value: "arts", label: "Arts / Music" },
];

const PRESETS: Record<SubjectType, Partial<FormValues>> = {
  core: {
    thMax: 75,
    prMax: 25,
    thPass: 25,
    prPass: 8,
    hasTheory: true,
    hasPractical: true,
  },
  language: {
    thMax: 75,
    prMax: 25,
    thPass: 25,
    prPass: 8,
    hasTheory: true,
    hasPractical: true,
  },
  vocational: {
    thMax: 40,
    prMax: 60,
    thPass: 13,
    prPass: 20,
    hasTheory: true,
    hasPractical: true,
  },
  arts: {
    thMax: 25,
    prMax: 75,
    thPass: 8,
    prPass: 25,
    hasTheory: true,
    hasPractical: true,
  },
};

export function SubjectDialog({
  open,
  onClose,
  onSave,
  initial,
  existingCodes,
}: Props) {
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? {
      code: undefined,
      name: "",
      nameHindi: "",
      type: "core",
      ...PRESETS.core,
    },
  });

  useEffect(() => {
    if (open) reset(initial ?? { type: "core", ...PRESETS.core });
  }, [open, initial, reset]);

  const watchType = watch("type");
  const watchThMax = watch("thMax");
  const watchPrMax = watch("prMax");
  const hasTheory = watch("hasTheory");
  const hasPractical = watch("hasPractical");

  // Apply preset when type changes
  const applyPreset = (type: SubjectType) => {
    const preset = PRESETS[type];
    Object.entries(preset).forEach(([k, v]) =>
      setValue(k as keyof FormValues, v as never),
    );
    setValue("type", type);
  };

  const onSubmit = (data: FormValues) => {
    onSave(data as SubjectRule);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit Subject — ${initial?.name}` : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-1">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Subject Code *</Label>
              <Input
                type="number"
                placeholder="401"
                disabled={isEdit}
                {...register("code")}
              />
              {errors.code && (
                <p className="text-xs text-red-600">{errors.code.message}</p>
              )}
              {!isEdit && existingCodes.includes(Number(watch("code"))) && (
                <p className="text-xs text-red-600">Code already exists</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                value={watchType}
                onValueChange={(v) => applyPreset(v as SubjectType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Subject Name (English) *</Label>
              <Input placeholder="Hindi" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Subject Name (Hindi)</Label>
              <Input placeholder="हिन्दी" {...register("nameHindi")} />
            </div>
          </div>

          <Separator />

          {/* Theory / Practical toggles */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 flex-1 rounded-lg border p-3">
              <Switch
                checked={hasTheory}
                onCheckedChange={(v) => setValue("hasTheory", v)}
                id="has-theory"
              />
              <label
                htmlFor="has-theory"
                className="text-sm font-medium cursor-pointer"
              >
                Has Theory
              </label>
            </div>
            <div className="flex items-center gap-2 flex-1 rounded-lg border p-3">
              <Switch
                checked={hasPractical}
                onCheckedChange={(v) => setValue("hasPractical", v)}
                id="has-practical"
              />
              <label
                htmlFor="has-practical"
                className="text-sm font-medium cursor-pointer"
              >
                Has Practical
              </label>
            </div>
          </div>

          {/* Marks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Marks Split
              </p>
              <p
                className={`text-xs font-semibold ${
                  watchThMax + watchPrMax === 100
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                Total: {(watchThMax || 0) + (watchPrMax || 0)} / 100
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Theory Max</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  disabled={!hasTheory}
                  {...register("thMax")}
                />
                {errors.thMax && (
                  <p className="text-xs text-red-600">{errors.thMax.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Practical Max</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  disabled={!hasPractical}
                  {...register("prMax")}
                />
                {errors.prMax && (
                  <p className="text-xs text-red-600">{errors.prMax.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Theory Pass Min</Label>
                <Input
                  type="number"
                  min={0}
                  disabled={!hasTheory}
                  {...register("thPass")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Practical Pass Min</Label>
                <Input
                  type="number"
                  min={0}
                  disabled={!hasPractical}
                  {...register("prPass")}
                />
              </div>
            </div>
          </div>

          {/* Preset hint */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Preset applied:</span>{" "}
              {watchType === "vocational" &&
                "Vocational — TH 40 / PR 60, pass TH≥13, PR≥20"}
              {watchType === "arts" &&
                "Arts/Music — TH 25 / PR 75, pass TH≥8, PR≥25"}
              {(watchType === "core" || watchType === "language") &&
                "Core/Language — TH 75 / PR 25, pass TH≥25, PR≥8"}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Subject" : "Add Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
