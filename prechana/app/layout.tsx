import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRECHANA: Your Problem. The Right Authority.",
  description: "Report civic problems with a photo and location. Track every action until it is resolved.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
