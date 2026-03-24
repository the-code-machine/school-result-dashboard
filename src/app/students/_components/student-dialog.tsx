"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudentsStore } from "@/store/students";
import { toast } from "@/hooks/use-toast";
import type { Student, Gender, Category } from "@/types";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  rollNumber: z.string().min(1, "Roll number required"),
  name: z.string().min(2, "Name required"),
  nameHindi: z.string().optional(),
  fatherName: z.string().min(2, "Father name required"),
  motherName: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["M", "F", "O"]),
  category: z.enum(["GEN", "OBC", "SC", "ST"]),
  medium: z.string().min(1, "Medium required"),
  section: z.string().optional(),
  scholarNumber: z.string().optional(),
  sssmid: z.string().optional(),
  enrolmentNumber: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  existingRolls: string[];
  initial?: Student | null;
}

export function StudentDialog({
  open,
  onClose,
  sessionId,
  existingRolls,
  initial,
}: Props) {
  const { addStudent, updateStudent } = useStudentsStore();
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
    defaultValues: {
      gender: "M",
      category: "GEN",
      medium: "Hindi",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              rollNumber: initial.rollNumber,
              name: initial.name,
              nameHindi: initial.nameHindi ?? "",
              fatherName: initial.fatherName,
              motherName: initial.motherName ?? "",
              dob: initial.dob ?? "",
              gender: initial.gender,
              category: initial.category,
              medium: initial.medium,
              section: initial.section ?? "",
              scholarNumber: initial.scholarNumber ?? "",
              sssmid: initial.sssmid ?? "",
              enrolmentNumber: initial.enrolmentNumber ?? "",
            }
          : {
              rollNumber: "",
              name: "",
              nameHindi: "",
              fatherName: "",
              motherName: "",
              dob: "",
              gender: "M",
              category: "GEN",
              medium: "Hindi",
              section: "",
              scholarNumber: "",
              sssmid: "",
              enrolmentNumber: "",
            },
      );
    }
  }, [open, initial, reset]);

  const watchGender = watch("gender");
  const watchCategory = watch("category");
  const watchMedium = watch("medium");

  const onSubmit = (data: FormValues) => {
    // Duplicate roll check
    const dupeRoll =
      existingRolls.includes(data.rollNumber) &&
      initial?.rollNumber !== data.rollNumber;
    if (dupeRoll) {
      toast({
        variant: "destructive",
        title: "Duplicate Roll",
        description: `Roll number ${data.rollNumber} already exists in this session.`,
      });
      return;
    }

    if (isEdit && initial) {
      updateStudent(initial.id, {
        ...data,
        gender: data.gender as Gender,
        category: data.category as Category,
      });
      toast({
        variant: "success",
        title: "Updated",
        description: `${data.name} updated.`,
      });
    } else {
      const student: Student = {
        id: crypto.randomUUID(),
        sessionId,
        rollNumber: data.rollNumber,
        name: data.name,
        nameHindi: data.nameHindi,
        fatherName: data.fatherName,
        motherName: data.motherName,
        dob: data.dob,
        gender: data.gender as Gender,
        category: data.category as Category,
        medium: data.medium,
        section: data.section,
        scholarNumber: data.scholarNumber,
        sssmid: data.sssmid,
        enrolmentNumber: data.enrolmentNumber,
        marks: [],
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addStudent(student);
      toast({
        variant: "success",
        title: "Student Added",
        description: `${data.name} (Roll ${data.rollNumber}) added.`,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit — ${initial?.name}` : "Add New Student"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-1">
          {/* Identity */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Identity
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Roll Number *</Label>
                <Input placeholder="01" {...register("rollNumber")} />
                {errors.rollNumber && (
                  <p className="text-xs text-red-600">
                    {errors.rollNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Scholar Number</Label>
                <Input
                  placeholder="MP2024XXXX"
                  {...register("scholarNumber")}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Full Name (English) *</Label>
                <Input placeholder="Ramesh Kumar" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Full Name (Hindi)</Label>
                <Input placeholder="रमेश कुमार" {...register("nameHindi")} />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Father Name *</Label>
                <Input placeholder="Suresh Kumar" {...register("fatherName")} />
                {errors.fatherName && (
                  <p className="text-xs text-red-600">
                    {errors.fatherName.message}
                  </p>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Mother Name</Label>
                <Input placeholder="Sunita Devi" {...register("motherName")} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Personal Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" {...register("dob")} />
              </div>

              <div className="space-y-1.5">
                <Label>Gender *</Label>
                <Select
                  value={watchGender}
                  onValueChange={(v) => setValue("gender", v as Gender)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select
                  value={watchCategory}
                  onValueChange={(v) => setValue("category", v as Category)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GEN">General</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Medium *</Label>
                <Select
                  value={watchMedium}
                  onValueChange={(v) => setValue("medium", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Section</Label>
                <Input placeholder="A" maxLength={3} {...register("section")} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Government IDs */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Government IDs
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>SSSMID</Label>
                <Input
                  placeholder="12-digit ID"
                  maxLength={12}
                  {...register("sssmid")}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Enrolment Number</Label>
                <Input
                  placeholder="UDISE enrolment"
                  {...register("enrolmentNumber")}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Student" : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
