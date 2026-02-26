import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cheat Meal",
  description: "Spend your last calories wisely.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
