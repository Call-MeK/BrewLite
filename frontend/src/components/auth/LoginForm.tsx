"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Smartphone } from "lucide-react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import TextField from "@/components/ui/TextField";
import { isValidPhone, normalizePhone } from "@/lib/validators";
import AuthSwitch from "./AuthSwitch";
import { authLayout } from "./auth.layout";
import { authCopy } from "./auth.copy";

const t = authCopy.login;

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!isValidPhone(phone)) next.phone = t.errors.phone;
    if (!password) next.password = t.errors.password;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // TODO: gọi API đăng nhập (POST /auth/login)
      console.log({ phone: normalizePhone(phone), password, remember });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={authLayout.form}>
      <h2 className={authLayout.title}>{t.title}</h2>
      <p className={`${authLayout.subtitle} mb-5`}>{t.subtitle}</p>

      <div className={authLayout.fields}>
        <TextField
          id="phone"
          label={t.phoneLabel}
          showLabel
          icon={<Smartphone size={16} />}
          type="tel"
          placeholder={t.phonePlaceholder}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          error={errors.phone}
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

      <div className="mt-3 flex items-center justify-between">
        <Checkbox
          label={t.remember}
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <Link href="/forgot-password" className="text-[11px] text-[color:var(--bw-ink-muted)] hover:underline">
          {t.forgot}
        </Link>
      </div>

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
