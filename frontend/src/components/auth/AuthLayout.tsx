import type { ReactNode } from "react";
import AuthHeader from "./AuthHeader";
import { authLayout } from "./auth.layout";

// Khung chung của Login và Sign up
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className={authLayout.screen}>
      <div className={authLayout.frame}>
        <AuthHeader />
        {children}
      </div>
    </main>
  );
}
