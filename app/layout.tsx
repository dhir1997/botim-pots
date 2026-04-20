import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Botim Pots",
  description: "Botim Pots product prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
