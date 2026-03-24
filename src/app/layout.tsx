import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { OnboardingModal } from "@/components/onboarding-modal";

export const metadata: Metadata = {
  title: "School Result Management",
  description: "MPBSE Result Management System — Nehru Memorial HSS Kurwai",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <OnboardingModal />
        <Toaster />
      </body>
    </html>
  );
}
