import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComplaintLens",
  description: "AI-powered complaint intelligence dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
