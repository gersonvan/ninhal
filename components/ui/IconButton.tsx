import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

const variantClasses: Record<Variant, string> = {
  primary: "bg-oliva-600 border-none",
  secondary: "bg-white border-[1.5px] border-border",
};

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon: ReactNode;
  "aria-label": string;
}

export default function IconButton({
  variant = "primary",
  icon,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
