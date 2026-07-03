"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV_ITEMS, NEW_BIRD_HREF, SIDEBAR_ITEMS } from "./nav-items";
import { PlusIcon } from "./icons";

export interface AppShellProps {
  tenantName: string;
  children: React.ReactNode;
}

export default function AppShell({ tenantName, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden min-[900px]:flex w-60 shrink-0 bg-surface border-r border-border p-4 flex-col gap-7 sticky top-0 h-screen box-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-[10px] bg-oliva-600 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F7F3EA"
              strokeWidth={1.8}
            >
              <path d="M12 3c-3 2-5 5-5 9a5 5 0 0010 0c0-4-2-7-5-9z" />
              <path d="M12 12v9" />
              <path d="M8 21h8" />
            </svg>
          </div>
          <div className="font-serif font-semibold text-base text-text-primary">
            {tenantName}
          </div>
        </div>

        {SIDEBAR_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-[11px] rounded-[10px] no-underline font-sans font-bold text-sm ${
                active
                  ? "bg-success-bg text-success-text"
                  : "text-text-secondary"
              }`}
            >
              <Icon color={active ? "#3C4A2F" : "#6b6656"} />
              {label}
            </Link>
          );
        })}

        <Link
          href={NEW_BIRD_HREF}
          className="mt-auto flex items-center justify-center gap-2 px-3 py-3 rounded-[10px] no-underline bg-oliva-600 text-background font-sans font-bold text-sm"
        >
          <PlusIcon color="#F7F3EA" />
          Cadastrar ave
        </Link>
      </aside>

      <div className="flex-1 min-w-0 pb-6 min-[900px]:pb-0 box-border">
        {children}
      </div>

      <nav className="min-[900px]:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-2 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] flex justify-around items-center">
        {BOTTOM_NAV_ITEMS.slice(0, 2).map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 no-underline"
            >
              <Icon color={active ? "#4B5D3A" : "#a79e88"} />
              <span
                className={`text-[10px] font-bold font-sans ${
                  active ? "text-oliva-600" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        <Link
          href={NEW_BIRD_HREF}
          className="w-[46px] h-[46px] rounded-full bg-oliva-600 flex items-center justify-center -mt-4 no-underline"
        >
          <PlusIcon color="#fff" />
        </Link>

        {BOTTOM_NAV_ITEMS.slice(2).map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 no-underline"
            >
              <Icon color={active ? "#4B5D3A" : "#a79e88"} />
              <span
                className={`text-[10px] font-bold font-sans ${
                  active ? "text-oliva-600" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
