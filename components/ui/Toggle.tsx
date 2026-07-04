export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label": string;
}

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full relative shrink-0 transition-colors disabled:opacity-50 ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-oliva-600" : "bg-border"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-[right,left] ${
          checked ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  );
}
