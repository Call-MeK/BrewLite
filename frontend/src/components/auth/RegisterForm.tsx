"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { isValidEmail, isValidPassword } from "@/lib/validators";
import { ApiError, register } from "@/lib/api";
import AuthSwitch from "./AuthSwitch";
import { authLayout } from "./auth.layout";
import { authCopy } from "./auth.copy";

const t = authCopy.register;

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    if (password !== confirm) next.confirm = t.errors.confirm;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    const controller = new AbortController();
    pending.current = controller;
    try {
      await register({ email, password }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setPassword("");
      setConfirm("");
      router.replace("/login");
    } catch (error) {
      if (!controller.signal.aborted) setErrors({ form: error instanceof ApiError ? error.message : "Không thể đăng ký. Vui lòng thử lại." });
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={authLayout.form}>
      <div className={authLayout.fields}>
        <TextField id="email" label={t.emailPlaceholder} placeholder={t.emailPlaceholder}
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="email" error={errors.email} />
        <TextField id="password" label={t.passwordPlaceholder} placeholder={t.passwordPlaceholder}
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password" error={errors.password} />
        <TextField id="confirm" label={t.confirmPlaceholder} placeholder={t.confirmPlaceholder}
          type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password" error={errors.confirm} />
      </div>

      {errors.form && <p role="alert" className="mt-3 text-xs text-[color:var(--bw-error)]">{errors.form}</p>}

      <div className={authLayout.actions}>
        <Button type="submit" loading={loading} fullWidth={false} className="min-w-40">
          {t.submit}
        </Button>
        <AuthSwitch text={t.switchText} label={t.switchLabel} href="/login" />
      </div>
    </form>
  );
}
