import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "DreamWork",
  description: "AI-guided career roadmap and simulation platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
