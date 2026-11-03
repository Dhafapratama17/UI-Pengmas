"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Header, SidebarCloseButton } from "@/components/layout/header";
import { useSession } from "@/components/providers/session-provider";
import { SidebarBrand, SidebarNav } from "@/components/layout/sidebar-nav";
import { navForVariant, publicNav, type ShellVariant } from "@/lib/navigation";
import { useToast } from "@/components/ui/toast";

export interface ShellUser {
  id: string;
  fullName: string;
  role: string;
  roleLabel: string;
}

const roleLabelMap: Record<string, string> = {
  member: "Member ReteMali",
  volunteer: "Relawan Terverifikasi",
  admin: "Administrator",
  nonmember: "Pengunjung Publik",
};

export function AppShell({
  variant,
  activeTitle,
  children,
}: {
  variant: ShellVariant;
  activeTitle?: string;
  children: ReactNode;
}) {
  const items = variant === "public" ? publicNav : navForVariant(variant);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { session, setSession } = useSession();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const activeItem = items.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(`${item.href}/`)) ||
      (variant === "public" && item.href === "/beranda" && pathname === "/")
  );

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const shellUser: ShellUser | null = session
    ? {
        id: session.userId,
        fullName: session.fullName,
        role: session.role,
        roleLabel: roleLabelMap[session.role] ?? session.role,
      }
    : null;

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    toast("Anda telah keluar.", "success");
    router.push("/login");
  };

  return (
    <div className="min-h-dvh">
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-surface-soft bg-white shadow-drawer transition-all duration-200 lg:translate-x-0 lg:shadow-none ${
          collapsed ? "lg:w-20" : "lg:w-72"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between pr-2">
          <SidebarBrand collapsed={collapsed} />
          <SidebarCloseButton onClose={() => setOpen(false)} />
        </div>
        <SidebarNav
          items={items}
          collapsed={collapsed}
          onNavigate={() => setOpen(false)}
        />
        <div
          className={`hidden shrink-0 items-center border-t border-surface-soft p-3 lg:flex ${
            collapsed ? "justify-center" : "justify-start px-4"
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden rounded-field px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-blue hover:text-primary-deep lg:block"
            aria-label={collapsed ? "Perluas sidebar" : "Ringkas sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
      </aside>

      <div
        className={`flex min-h-dvh flex-col transition-[padding] duration-200 ${
          collapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <Header
          title={activeTitle ?? activeItem?.label ?? "ReteMali"}
          user={shellUser}
          onOpenSidebar={() => setOpen(true)}
          onSignOut={handleSignOut}
          usePublicLinks={variant === "public"}
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-surface-soft px-4 py-4 text-center text-xs text-ink-soft lg:px-6">
          Taman Baca ReteMali — ReteMali Web App
        </footer>
      </div>
    </div>
  );
}
