import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;         
  showLabel?: boolean;    // true: hiện nhãn phía trên ô (màn Login)
  icon?: ReactNode;       
  error?: string;
};

export default function TextField({
  id,
  label,
  showLabel = false,
  icon,
  error,
  className = "",
  ...rest
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className={showLabel ? "mb-1.5 block text-[11px] font-semibold" : "sr-only"}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--bw-ink)]">
            {icon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
          className={`h-12 w-full rounded-[10px] border bg-[color:var(--bw-field)] text-sm text-[color:var(--bw-ink)] outline-none transition-colors placeholder:text-[color:var(--bw-ink-muted)] focus:border-[color:var(--bw-accent)] focus:ring-1 focus:ring-[color:var(--bw-accent)] ${
            icon ? "pl-11 pr-4" : "px-4"
          } ${error ? "border-[color:var(--bw-error)]" : "border-[color:var(--bw-divider)]"} ${className}`}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 px-1 text-xs text-[color:var(--bw-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
