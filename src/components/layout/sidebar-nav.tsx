"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import type { NavItem } from "@/lib/navigation";

export function SidebarNav({
  items,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navigasi utama">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={item.label}
            className={`flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${
              active
                ? "bg-primary text-white"
                : "text-ink hover:bg-surface-blue hover:text-primary-deep"
            } ${collapsed ? "justify-center lg:px-0" : ""}`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className={`${collapsed ? "lg:hidden" : ""} truncate`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={`flex h-16 shrink-0 items-center border-b border-surface-soft px-4 pb-1 ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <Link href="/beranda" title="Ke Beranda" className="flex items-center">
        <Logo size={36} showName={!collapsed} />
      </Link>
    </div>
  );
}
