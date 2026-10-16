const PHONE_RE = /^(0|\+84)\d{9}$/;

/** "090 123 4567" -> "0901234567" */
export const normalizePhone = (v: string) => v.replace(/\s/g, "");

export const isValidPhone = (v: string) => PHONE_RE.test(normalizePhone(v));

export const MIN_PASSWORD = 6;
