import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export default function Checkbox({ label, className = "", ...rest }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 text-[11px] ${className}`}>
      <input type="checkbox" {...rest} className="h-4 w-4 accent-[color:var(--bw-ink)]" />
      {label}
    </label>
  );
}
