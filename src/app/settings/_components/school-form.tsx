"use client";

import { useEffect, useState } from "react";
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
import { Save, School, Image as ImageIcon, X } from "lucide-react";

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
  logoUrl: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function SchoolForm() {
  const { school, setSchool } = useSettingsStore();

  // FIX 1: Use absolute path "/logo.png"
  const [logoPreview, setLogoPreview] = useState<string>(
    school.logoUrl || "/logo.png",
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: school,
  });

  useEffect(() => {
    reset(school);
    // FIX 2: Ensure the useEffect also falls back to "/logo.png" instead of ""
    setLogoPreview(school.logoUrl || "/logo.png");
  }, [school, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Logo must be under 500KB. Please resize your image.",
        });
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setValue("logoUrl", base64String, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    // FIX 3: Revert to default logo when removed
    setLogoPreview("/logo.png");
    setValue("logoUrl", "", { shouldDirty: true });

    const fileInput = document.getElementById(
      "logo-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

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
      {/* ... [Identity Card goes here, same as before] ... */}
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

      {/* Media Card */}
      <Card>
        <CardHeader>
          <CardTitle>School Logo</CardTitle>
          <CardDescription>
            Upload a logo for the Marksheet printout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Logo Image</Label>
            <div className="flex items-center gap-4">
              {/* Preview Area */}
              {logoPreview ? (
                <div className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-white shadow-sm group">
                  <img
                    src={logoPreview}
                    alt="School Logo"
                    className="w-full h-full object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-0.5 right-0.5 bg-white/80 rounded-full p-0.5 text-gray-600 hover:text-red-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 shrink-0 text-gray-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              {/* Upload Input */}
              <div className="flex-1">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="cursor-pointer h-9 text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: JPG, PNG. Maximum size: 500KB.
                </p>
              </div>
            </div>
            <input type="hidden" {...register("logoUrl")} />
          </div>
        </CardContent>
      </Card>

      {/* ... [Address & Contact Cards go here, same as before] ... */}
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

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty} className="gap-2">
          <Save className="w-4 h-4" />
          Save School Info
        </Button>
      </div>
    </form>
  );
}
