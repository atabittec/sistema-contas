"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Repeat,
  CreditCard,
  Tags,
  LogOut,
  Wallet,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/lancamentos", label: "Lançamentos", icon: Receipt },
  { href: "/recorrentes", label: "Contas Fixas", icon: Repeat },
  { href: "/cartoes", label: "Cartões", icon: CreditCard },
  { href: "/categorias", label: "Categorias", icon: Tags },
];

function useIsActive(href: string) {
  const pathname = usePathname();
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppSidebar({
  userName,
  logoutAction,
}: {
  userName: string;
  logoutAction: () => Promise<void>;
}) {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col bg-slate-900 text-slate-300 md:flex">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
          <Wallet size={18} />
        </span>
        <span className="text-base font-semibold text-white">
          Contas da Casa
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_LINKS.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
      </nav>

      <div className="border-t border-slate-800 px-3 py-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
            {userName.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm text-slate-200">{userName}</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
}: (typeof NAV_LINKS)[number]) {
  const isActive = useIsActive(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-brand text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

export function MobileTopBar({
  userName,
  logoutAction,
}: {
  userName: string;
  logoutAction: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col border-b border-slate-200 bg-slate-900 text-slate-300 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
            <Wallet size={16} />
          </span>
          <span className="text-sm font-semibold text-white">
            Contas da Casa
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={14} />
            Sair ({userName})
          </button>
        </form>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
        {NAV_LINKS.map((link) => (
          <MobileLink key={link.href} {...link} />
        ))}
      </nav>
    </div>
  );
}

function MobileLink({ href, label, icon: Icon }: (typeof NAV_LINKS)[number]) {
  const isActive = useIsActive(href);
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
        isActive
          ? "bg-brand text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}
