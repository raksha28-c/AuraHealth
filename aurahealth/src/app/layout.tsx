import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuraHealth - Voice First Accessible Health",
  description: "AuraHealth offers accessible, voice-first guidance on general health, symptom checks, and facility lookups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
