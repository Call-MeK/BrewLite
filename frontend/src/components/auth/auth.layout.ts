/*
  BỐ CỤC của Login / Sign up. Mỗi dòng = class Tailwind của một vùng.
  1 đơn vị Tailwind = 4px (pt-24 = 96px). Màu lấy từ styles/brewlite-theme.css,
  chữ lấy từ auth.copy.ts.
*/
export const authLayout = {

  screen: "flex min-h-dvh w-full items-center justify-center bg-[color:var(--bw-stage)] sm:p-6",


  frame:
    "flex min-h-dvh w-full max-w-[390px] flex-col bg-[color:var(--bw-bg)] text-[color:var(--bw-ink)] sm:min-h-[680px] sm:rounded-[28px]",

  // Logo + tagline
  header: "flex flex-col items-center px-6 pt-24 pb-12 text-center",
 brand: "font-[family-name:var(--font-lora)] text-[40px] font-bold leading-none tracking-tight text-[color:var(--bw-brand)]",
  tagline: "mt-3 text-[10px] uppercase tracking-wide text-[color:var(--bw-ink-muted)]",

  // Form
  form: "flex flex-1 flex-col px-6 pb-8",
 title: "font-[family-name:var(--font-lora)] text-xl font-bold",
  subtitle: "mt-1 text-xs text-[color:var(--bw-ink-muted)]",
  fields: "flex flex-col gap-3",
  formError: "px-1 text-sm text-[color:var(--bw-error)]",

  // Khu nút + dòng chuyển trang
  actions: "mt-6 flex flex-col items-center gap-4",
  terms: "text-center text-[9px] leading-relaxed text-[color:var(--bw-ink-muted)]",
  switchText: "text-center text-xs text-[color:var(--bw-ink-muted)]",
  switchLink:
    "font-semibold text-[color:var(--bw-link)] underline-offset-2 hover:underline focus-visible:underline",
} as const;
