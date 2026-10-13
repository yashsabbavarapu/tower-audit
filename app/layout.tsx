import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const display = Inter_Tight({ subsets: ["latin"], weight: ["700"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Tower Audit",
  description: "Paste your GTM agent's output. Tower traces every claim to a source and flags what it made up.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Mirrors --paper; viewport metadata cannot read CSS variables.
  themeColor: "#F4F1E8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
