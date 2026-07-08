"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

export interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

/**
 * Campo de senha com botão de mostrar/ocultar. Público mobile digitando no
 * viveiro: ver o que digitou reduz muito os erros de "senha inválida".
 */
export default function PasswordField({
  label,
  id,
  className = "",
  ...props
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visivel, setVisivel] = useState(false);

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
      <div className="relative">
        <input
          id={inputId}
          type={visivel ? "text" : "password"}
          className={`w-full box-border font-sans text-[15px] pl-4 pr-12 py-3.5 rounded-[10px] border-[1.5px] border-input-border bg-white text-text-primary focus:outline-none focus:border-ambar focus:ring-[3px] focus:ring-warning-bg ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-0 top-0 h-full w-12 bg-transparent border-none cursor-pointer flex items-center justify-center"
        >
          {visivel ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8a8578"
              strokeWidth={1.8}
            >
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8a8578"
              strokeWidth={1.8}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
