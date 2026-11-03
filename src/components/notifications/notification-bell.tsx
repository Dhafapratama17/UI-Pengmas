"use client";

import Link from "next/link";
import { Bell, CircleCheck, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AppNotification } from "@/types/db";
import {
  notificationCategoryLabel,
  notificationCategoryTone,
  formatDateTimeWib,
} from "@/lib/status-labels";
import { Badge } from "@/components/ui/badge";

interface FetchState {
  items: AppNotification[];
  unread: number;
}

const notifikasiPageForRole: Record<string, string> = {
  member: "/member/notifikasi",
  volunteer: "/volunteer/notifikasi",
  admin: "/admin/notifikasi",
};

export function NotificationBell({ role }: { role: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FetchState>({ items: [], unread: 0 });
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifikasi?limit=6");
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setState({ items: data.items, unread: data.unread });
        }
      }
    } catch {
      setState({ items: [], unread: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load, pathname]);

  useEffect(() => {
    void load();
  }, [load, pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = async (id?: string) => {
    await fetch("/api/notifikasi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    await load();
    router.refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Notifikasi (${state.unread} belum dibaca)`}
        className="relative block rounded-full p-2 text-ink transition-colors hover:bg-surface-blue"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {state.unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {state.unread > 99 ? "99+" : state.unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-surface-soft bg-white p-2 shadow-pop"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-bold text-ink">Notifikasi</p>
            {state.unread > 0 ? (
              <button
                type="button"
                onClick={() => void markRead()}
                className="text-xs font-semibold text-primary-deep hover:underline"
              >
                Tandai semua dibaca
              </button>
            ) : null}
          </div>
          {loading && state.items.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-ink-soft">
              Memuat notifikasi…
            </p>
          ) : state.items.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-4 py-6 text-center">
              <Bell className="h-6 w-6 text-ink-soft/60" aria-hidden />
              <p className="text-sm font-semibold text-ink">
                Belum ada notifikasi
              </p>
              <p className="text-xs text-ink-soft">
                Pemberitahuan status akan muncul setelah ada aktivitas.
              </p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-surface-soft overflow-y-auto">
              {state.items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-start gap-2 px-2 py-2">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        item.readAt ? "bg-slate-200" : "bg-primary"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={notificationCategoryTone(item.category)}>
                          {notificationCategoryLabel(item.category)}
                        </Badge>
                        {!item.readAt ? (
                          <span className="text-[10px] font-bold text-primary-deep">
                            Baru
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-ink-soft">
                        {item.body}
                      </p>
                      <p className="text-[10px] text-ink-soft/70">
                        {formatDateTimeWib(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      {item.href ? (
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (!item.readAt) void markRead(item.id);
                            setOpen(false);
                          }}
                          aria-label="Buka terkait"
                          className="rounded-field p-1 text-ink-soft hover:bg-surface-blue hover:text-primary-deep"
                        >
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </Link>
                      ) : null}
                      {!item.readAt ? (
                        <button
                          type="button"
                          onClick={() => void markRead(item.id)}
                          aria-label="Tandai dibaca"
                          className="rounded-field p-1 text-ink-soft hover:bg-surface-blue hover:text-success"
                        >
                          <CircleCheck className="h-4 w-4" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={notifikasiPageForRole[role] ?? notifikasiPageForRole.member}
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-field px-3 py-2 text-center text-xs font-semibold text-primary-deep hover:bg-surface-blue"
          >
            Lihat semua notifikasi
          </Link>
        </div>
      ) : null}
    </div>
  );
}
