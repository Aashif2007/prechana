import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRECHANA — Your Problem. The Right Authority.",
  description:
    "Report civic problems with a photo and location. PRECHANA routes your complaint, tracks every action, and follows it until resolution.",
  keywords: ["civic complaints", "prechana", "government", "report pothole", "streetlight"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
