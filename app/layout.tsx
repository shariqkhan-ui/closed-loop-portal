import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Netbox Bug — Detection to Closure",
  description: "Seven-stage Netbox bug-closure engine: Sense → Triage → Diagnose → Design → Pilot → Rollout → Verify",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
