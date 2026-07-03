import type { ReactNode } from "react";

export type AlertVariant = "warning" | "success" | "danger";

const containerClasses: Record<AlertVariant, string> = {
  warning: "bg-warning-bg border-ambar",
  success: "bg-success-bg border-oliva-400",
  danger: "bg-danger-bg border-terracota",
};

const textClasses: Record<AlertVariant, string> = {
  warning: "text-[#6B3E17]",
  success: "text-success-text",
  danger: "text-[#8A3830]",
};

const iconStrokeClasses: Record<AlertVariant, string> = {
  warning: "stroke-[#8B5A24]",
  success: "stroke-success-text",
  danger: "stroke-[#8A3830]",
};

const icons: Record<AlertVariant, ReactNode> = {
  warning: (
    <path d="M12 2L1 21h22L12 2z M12 9v5 M12 17h.01" strokeLinejoin="round" />
  ),
  success: <path d="M8 12l3 3 5-6" />,
  danger: <path d="M15 9l-6 6 M9 9l6 6" />,
};

export interface AlertProps {
  variant: AlertVariant;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function Alert({
  variant,
  title,
  description,
  action,
}: AlertProps) {
  return (
    <div
      className={`rounded-xl border-[1.5px] px-[18px] py-4 flex gap-3 items-start ${containerClasses[variant]}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={variant === "success" ? 2 : 2}
        className={`shrink-0 ${iconStrokeClasses[variant]}`}
      >
        {variant === "success" ? (
          <>
            <circle cx="12" cy="12" r="10" />
            {icons.success}
          </>
        ) : variant === "danger" ? (
          <>
            <circle cx="12" cy="12" r="10" />
            {icons.danger}
          </>
        ) : (
          icons.warning
        )}
      </svg>
      <div className="flex-1">
        <div className={`font-sans font-extrabold text-sm ${textClasses[variant]}`}>
          {title}
        </div>
        {description && (
          <div className={`font-sans text-[13px] mt-0.5 ${textClasses[variant]}`}>
            {description}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}
