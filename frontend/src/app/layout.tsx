import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrewLite",
  description: "Ứng dụng đặt cà phê và thanh toán không tiền mặt",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
