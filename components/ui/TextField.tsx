import { useId, type InputHTMLAttributes } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mono?: boolean;
}

export default function TextField({
  label,
  error,
  mono = false,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-bold text-[#4a4638]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${
          mono ? "font-mono" : "font-sans"
        } text-[15px] px-4 py-3.5 rounded-[10px] border-[1.5px] bg-white text-text-primary focus:outline-none focus:border-ambar focus:ring-[3px] focus:ring-warning-bg ${
          error ? "border-terracota" : "border-input-border"
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs font-semibold text-terracota">{error}</span>
      )}
    </div>
  );
}
