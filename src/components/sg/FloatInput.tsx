import { useState, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
};

export function FloatInput({ label, icon, hint, error, className, value, ...rest }: Props) {
  const [focus, setFocus] = useState(false);
  const filled = focus || (value !== undefined && String(value).length > 0);
  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl border bg-card/60 backdrop-blur transition-colors ${
          error
            ? "border-destructive"
            : focus
            ? "border-[oklch(0.82_0.14_85/0.7)] gold-glow"
            : "border-border"
        }`}
      >
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <label
          className={`pointer-events-none absolute right-11 transition-all ${
            filled
              ? "top-1.5 text-[10px] text-gold"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          }`}
        >
          {label}
        </label>
        <input
          {...rest}
          value={value}
          onFocus={(e) => {
            setFocus(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            rest.onBlur?.(e);
          }}
          className={`w-full bg-transparent px-4 pr-11 pt-5 pb-2 text-sm text-foreground outline-none ${className ?? ""}`}
        />
      </div>
      {hint && !error && <p className="mt-1 pr-2 text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 pr-2 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}