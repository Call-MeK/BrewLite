"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { isValidPhone, MIN_PASSWORD, normalizePhone } from "@/lib/validators";
import AuthSwitch from "./AuthSwitch";
import { authLayout } from "./auth.layout";
import { authCopy } from "./auth.copy";

const t = authCopy.register;

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = t.errors.name;
    if (!isValidPhone(phone)) next.phone = t.errors.phone;
    if (password.length < MIN_PASSWORD) next.password = t.errors.password;
    if (password !== confirm) next.confirm = t.errors.confirm;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // TODO: gọi API đăng ký (POST /auth/register)
      console.log({ name: name.trim(), phone: normalizePhone(phone), password });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={authLayout.form}>
      <div className={authLayout.fields}>
        <TextField id="name" label={t.namePlaceholder} placeholder={t.namePlaceholder}
          value={name} onChange={(e) => setName(e.target.value)}
          autoComplete="name" error={errors.name} />
        <TextField id="phone" label={t.phonePlaceholder} placeholder={t.phonePlaceholder}
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel" error={errors.phone} />
        <TextField id="password" label={t.passwordPlaceholder} placeholder={t.passwordPlaceholder}
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password" error={errors.password} />
        <TextField id="confirm" label={t.confirmPlaceholder} placeholder={t.confirmPlaceholder}
          type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password" error={errors.confirm} />
      </div>

      <div className={authLayout.actions}>
        <Button type="submit" loading={loading} fullWidth={false} className="min-w-40">
          {t.submit}
        </Button>
        <AuthSwitch text={t.switchText} label={t.switchLabel} href="/login" />
      </div>
    </form>
  );
}
