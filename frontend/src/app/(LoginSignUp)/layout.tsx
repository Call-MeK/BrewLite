import type { ReactNode } from "react";
import { Inter, Lora } from "next/font/google";
import "@/styles/brewlite-theme.css"; // nạp các biến màu --bw-*

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin", "vietnamese"], variable: "--font-lora" });

// Layout riêng cho Login / Sign up: nạp font + theme
export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} ${lora.variable} font-[family-name:var(--font-inter)]`}>
      {children}
    </div>
  );
}