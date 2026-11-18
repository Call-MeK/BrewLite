"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { isValidEmail, isValidPassword } from "@/lib/validators";
import { ApiError, login } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import AuthSwitch from "./AuthSwitch";
import { authLayout } from "./auth.layout";
import { authCopy } from "./auth.copy";

const t = authCopy.login;

export default function LoginForm() {
  const router = useRouter();
  const { startSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const next: Record<string, string> = {};
    if (!isValidEmail(email)) next.email = t.errors.email;
    if (!isValidPassword(password)) next.password = t.errors.password;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    const controller = new AbortController();
    pending.current = controller;
    try {
      const response = await login({ email, password }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      startSession(response);
      setPassword("");
      router.replace("/menu");
    } catch (error) {
      if (!controller.signal.aborted) setErrors({ form: error instanceof ApiError ? error.message : "Không thể đăng nhập. Vui lòng thử lại." });
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={authLayout.form}>
      <h2 className={authLayout.title}>{t.title}</h2>
      <p className={`${authLayout.subtitle} mb-5`}>{t.subtitle}</p>

      <div className={authLayout.fields}>
        <TextField
          id="email"
          label={t.emailLabel}
          showLabel
          icon={<Mail size={16} />}
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          id="password"
          label={t.passwordLabel}
          showLabel
          icon={<Lock size={16} />}
          type="password"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          error={errors.password}
        />
      </div>

      {errors.form && <p role="alert" className="mt-3 text-xs text-[color:var(--bw-error)]">{errors.form}</p>}

      <div className={authLayout.actions}>
        <Button type="submit" loading={loading}>
          {t.submit}
        </Button>
        <p className={authLayout.terms}>{t.terms}</p>
        <AuthSwitch text={t.switchText} label={t.switchLabel} href="/register" />
      </div>
    </form>
  );
}
