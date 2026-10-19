import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;    // true: khóa nút (chống bấm đúp) khi đang gửi dữ liệu
  fullWidth?: boolean;  // mặc định rộng hết khung
};

export default function Button({
  loading = false,
  fullWidth = true,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`h-12 rounded-full border border-[color:var(--bw-accent-border)] bg-[color:var(--bw-accent)] px-8 text-sm font-medium text-white transition-colors hover:bg-[color:var(--bw-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--bw-ink)] disabled:cursor-not-allowed disabled:opacity-70 ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
