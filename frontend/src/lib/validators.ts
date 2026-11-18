export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
export const isValidPassword = (value: string) => value.length >= 8;
