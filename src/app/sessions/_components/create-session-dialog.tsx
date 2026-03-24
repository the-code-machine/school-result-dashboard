"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSettingsStore } from "@/store/settings";
import { toast } from "@/hooks/use-toast";
import type { ClassId, Stream } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Info } from "lucide-react";

const schema = z.object({
  year: z.string().min(4, "Session year required e.g. 2024-25"),
  classId: z.enum(["9", "10", "11", "12"]),
  stream: z.enum(["Science", "Commerce", "Arts", "NA"]),
  section: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CURRENT_YEAR = (() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed
  // Academic year: April start
  return m >= 3
    ? `${y}-${String(y + 1).slice(2)}`
    : `${y - 1}-${String(y).slice(2)}`;
})();

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateSessionDialog({ open, onClose }: Props) {
  const { addSession, sessions, classConfigs } = useSettingsStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: CURRENT_YEAR,
      classId: "9",
      stream: "NA",
      section: "",
    },
  });

  useEffect(() => {
    if (open)
      reset({
        year: CURRENT_YEAR,
        classId: "9",
        stream: "NA",
        section: "",
      });
  }, [open, reset]);

  const watchClass = watch("classId");
  const watchStream = watch("stream");

  // Class 11/12 need stream; 9/10 don't
  const needsStream = watchClass === "11" || watchClass === "12";

  // Check if this exact session already exists
  const duplicate = sessions.some(
    (s) =>
      s.year === watch("year") &&
      s.classId === watchClass &&
      s.stream === (needsStream ? watchStream : "NA") &&
      (s.section ?? "") === (watch("section") ?? ""),
  );

  const cfg = classConfigs[watchClass];

  const onSubmit = (data: FormValues) => {
    if (duplicate) return;

    const session = {
      id: crypto.randomUUID(),
      year: data.year,
      classId: data.classId as ClassId,
      stream: needsStream ? (data.stream as Stream) : "NA",
      section: data.section || undefined,
      isLocked: false,
      createdAt: new Date().toISOString(),
    };

    addSession(session);
    toast({
      variant: "success",
      title: "Session Created",
      description: `Class ${data.classId} · ${data.year}${data.section ? ` · Section ${data.section}` : ""}`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            A session represents one exam period for a class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          {/* Year */}
          <div className="space-y-1.5">
            <Label htmlFor="year">Academic Year *</Label>
            <Input id="year" placeholder="2024-25" {...register("year")} />
            {errors.year && (
              <p className="text-xs text-red-600">{errors.year.message}</p>
            )}
            <p className="text-xs text-gray-400">
              Format: YYYY-YY e.g. 2024-25
            </p>
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <Label>Class *</Label>
            <Select
              value={watchClass}
              onValueChange={(v) => {
                setValue("classId", v as ClassId);
                if (v !== "11" && v !== "12") setValue("stream", "NA");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9">Class 9th</SelectItem>
                <SelectItem value="10">Class 10th</SelectItem>
                <SelectItem value="11">Class 11th</SelectItem>
                <SelectItem value="12">Class 12th</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stream — only for 11/12 */}
          {needsStream && (
            <div className="space-y-1.5">
              <Label>Stream *</Label>
              <Select
                value={watchStream}
                onValueChange={(v) => setValue("stream", v as Stream)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Stream determines which subjects are available
              </p>
            </div>
          )}

          {/* Section */}
          <div className="space-y-1.5">
            <Label htmlFor="section">
              Section{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="section"
              placeholder="A"
              maxLength={2}
              className="w-24"
              {...register("section")}
            />
            <p className="text-xs text-gray-400">
              Leave blank if school has single section
            </p>
          </div>

          {/* Config preview */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600">
              Config preview for Class {watchClass}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                ["Subjects counted", cfg.totalSubjects],
                ["Best of", `${cfg.bestOfCount} subjects`],
                ["Max marks", cfg.totalMaxMarks],
                ["% denominator", cfg.percentageDenominator],
                ["Pass %", `${cfg.passPercentage}%`],
                ["Suppl. if fail ≤", `${cfg.maxFailForSuppl} subjects`],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-xs text-gray-500">{k}</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Duplicate warning */}
          {duplicate && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-2">
              <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                A session for Class {watchClass} · {watch("year")}
                {watch("section") ? ` · Section ${watch("section")}` : ""}{" "}
                already exists.
              </p>
            </div>
          )}

          <Separator />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={duplicate}>
              Create Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
