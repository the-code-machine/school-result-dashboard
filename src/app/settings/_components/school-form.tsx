"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSettingsStore } from "@/store/settings";
import { toast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, School } from "lucide-react";

const schema = z.object({
  name: z.string().min(3, "School name is required"),
  nameHindi: z.string().optional(),
  diseCode: z.string().min(11, "DISE code must be 11 digits").max(11),
  mpbseCode: z.string().min(4, "MPBSE code required"),
  principal: z.string().optional(),
  address: z.string().optional(),
  block: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function SchoolForm() {
  const { school, setSchool } = useSettingsStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: school,
  });

  // sync store → form when store changes
  useEffect(() => {
    reset(school);
  }, [school, reset]);

  const onSubmit = (data: FormValues) => {
    setSchool(data);
    toast({
      variant: "success",
      title: "Saved",
      description: "School info updated.",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-4 h-4 text-blue-600" />
            School Identity
          </CardTitle>
          <CardDescription>Official name and government codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="name">School Name (English) *</Label>
              <Input
                id="name"
                placeholder="Nehru Memorial Higher Secondary School"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="nameHindi">School Name (Hindi)</Label>
              <Input
                id="nameHindi"
                placeholder="नेहरू स्मारक उच्चतर माध्यमिक विद्यालय"
                {...register("nameHindi")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="diseCode">DISE Code *</Label>
              <Input
                id="diseCode"
                placeholder="23310300104"
                maxLength={11}
                {...register("diseCode")}
              />
              {errors.diseCode && (
                <p className="text-xs text-red-600">
                  {errors.diseCode.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mpbseCode">MPBSE Code *</Label>
              <Input
                id="mpbseCode"
                placeholder="622055"
                {...register("mpbseCode")}
              />
              {errors.mpbseCode && (
                <p className="text-xs text-red-600">
                  {errors.mpbseCode.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="principal">Principal Name</Label>
              <Input
                id="principal"
                placeholder="Mr. / Mrs. ..."
                {...register("principal")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="address">Street / Village</Label>
              <Textarea
                id="address"
                rows={2}
                placeholder="Village / Ward / Street"
                {...register("address")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="block">Block</Label>
              <Input id="block" placeholder="Kurwai" {...register("block")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="Vidisha"
                {...register("district")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Madhya Pradesh"
                {...register("state")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="07594-XXXXXX"
                {...register("phone")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="school@mp.gov.in"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty} className="gap-2">
          <Save className="w-4 h-4" />
          Save School Info
        </Button>
      </div>
    </form>
  );
}
