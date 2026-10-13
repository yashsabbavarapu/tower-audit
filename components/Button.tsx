import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "outline" | "ghost" | "icon" | "link";

const VARIANTS: Record<Variant, string> = {
  // Transparent CTA: hairline border, ink text, amber on hover.
  outline:
    "rounded-control border border-line bg-transparent px-5 font-display text-16 font-semibold tracking-display text-ink hover:border-amber hover:text-amber-ink active:translate-y-px disabled:text-faint disabled:active:translate-y-0 disabled:hover:border-line disabled:hover:text-faint",
  ghost:
    "h-10 rounded-control border border-line bg-transparent px-4 text-14 font-medium text-ink hover:border-faint hover:bg-surface active:bg-paper disabled:hover:border-line disabled:hover:bg-transparent",
  icon: "size-10 shrink-0 rounded-control border border-line bg-transparent text-muted hover:border-faint hover:bg-paper hover:text-ink active:bg-surface disabled:hover:border-line disabled:hover:bg-transparent",
  link: "readout rounded-control px-1 text-muted underline decoration-line underline-offset-4 hover:text-ink hover:decoration-muted active:text-amber-ink disabled:hover:text-muted",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "ghost", className = "", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`pressable inline-flex select-none items-center justify-center gap-2 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
});
