import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
};

export function GoldButton({ children, className, fullWidth = true, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`btn-gold rounded-2xl px-6 py-3.5 text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? "w-full" : ""
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}