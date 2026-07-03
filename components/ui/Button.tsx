import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";
type Size = "default" | "small";

const base =
  "inline-flex items-center justify-center font-sans font-bold rounded-[10px] cursor-pointer disabled:cursor-not-allowed transition-colors";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-oliva-600 text-background border-none disabled:bg-border disabled:text-text-muted",
  secondary:
    "bg-transparent text-oliva-600 border-[1.5px] border-oliva-600 disabled:border-border disabled:text-text-muted",
  tertiary: "bg-transparent text-oliva-600 border-none px-3",
  destructive:
    "bg-terracota text-white border-none disabled:bg-border disabled:text-text-muted",
};

const sizeClasses: Record<Size, string> = {
  default: "text-[15px] px-6 py-3.5",
  small: "text-[13px] px-4 py-2.5 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export default function Button({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  const sizing = variant === "tertiary" ? "text-[15px] py-3.5" : sizeClasses[size];
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizing} ${className}`}
      {...props}
    />
  );
}
