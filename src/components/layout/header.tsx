"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { publicNav } from "@/lib/navigation";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface HeaderUser {
  id: string;
  fullName: string;
  role: string;
  roleLabel: string;
}

const rolePages: Record<string, string> = {
  member: "/member/profil",
  volunteer: "/volunteer/profil",
  admin: "/admin/pengaturan",
};

function Dropdown({
  trigger,
  children,
  open,
  onToggle,
}: {
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onToggle();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onToggle();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onToggle]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-full transition-colors hover:bg-surface-blue"
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-card border border-surface-soft bg-white p-2 shadow-pop"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Header({
  title,
  user,
  onOpenSidebar,
  onSignOut,
  usePublicLinks = false,
}: {
  title: string;
  user?: HeaderUser | null;
  onOpenSidebar: () => void;
  onSignOut: () => void;
  usePublicLinks?: boolean;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const signOut = async () => {
    setUserMenuOpen(false);
    await onSignOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-surface-soft bg-white/90 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Buka menu navigasi"
        className="rounded-field p-2 text-ink transition-colors hover:bg-surface-blue lg:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      <h1 className="min-w-0 flex-1 truncate text-base font-bold text-primary-deep lg:text-lg">
        {title}
      </h1>

      {usePublicLinks ? (
        <nav className="hidden items-center gap-4 xl:flex" aria-label="Navigasi cepat">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-field px-2 py-1 text-sm font-semibold text-ink-soft transition-colors hover:text-primary-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {user ? (
        <NotificationBell role={user.role} />
      ) : null}

      {user ? (
        <Dropdown
          open={userMenuOpen}
          onToggle={() => setUserMenuOpen((v) => !v)}
          trigger={
            <span className="flex items-center gap-1.5 p-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
              <ChevronDown className="h-4 w-4 text-ink-soft" aria-hidden />
              <span className="sr-only">Menu akun</span>
            </span>
          }
        >
          <div className="border-b border-surface-soft px-3 pb-2 pt-1.5">
            <p className="truncate text-sm font-bold text-ink">
              {user.fullName}
            </p>
            <Badge tone="info" className="mt-1">
              {user.roleLabel}
            </Badge>
          </div>
          <Link
            role="menuitem"
            href={rolePages[user.role] ?? "/"}
            onClick={() => setUserMenuOpen(false)}
            className="mt-1 block rounded-field px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-blue"
          >
            Profil Saya
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-field px-3 py-2 text-left text-sm font-semibold text-danger transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Keluar
          </button>
        </Dropdown>
      ) : (
        <Link
          href="/login"
          className="ml-1 rounded-field bg-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
        >
          Masuk
        </Link>
      )}
    </header>
  );
}

export function SidebarCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Tutup menu navigasi"
      className="rounded-field p-2 text-ink transition-colors hover:bg-surface-blue lg:hidden"
    >
      <X className="h-6 w-6" aria-hidden />
    </button>
  );
}
