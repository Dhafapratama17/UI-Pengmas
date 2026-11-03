"use client";

import Link from "next/link";
import { CircleCheck, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AppNotification } from "@/types/db";
import { Badge } from "@/components/ui/badge";
import {
  notificationCategoryLabel,
  notificationCategoryTone,
  formatDateTimeWib,
} from "@/lib/status-labels";

export function NotificationsInbox() {
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifikasi");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Gagal memuat notifikasi. Coba lagi.");
        setItems([]);
        return;
      }
      setItems(data.items);
      setUnread(data.unread);
      setError(null);
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (body: { id?: string; all?: boolean }, key: string) => {
    setBusy(key);
    await fetch("/api/notifikasi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
    setBusy(null);
  };

  if (items === null) {
    return <p className="text-sm text-ink-soft">Memuat notifikasi…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          {unread > 0
            ? `${unread} notifikasi belum dibaca`
            : "Semua notifikasi telah dibaca"}
        </p>
        {unread > 0 ? (
          <button
            type="button"
            className="text-sm font-semibold text-primary-deep hover:underline"
            onClick={() => void markRead({ all: true }, "all")}
            disabled={busy === "all"}
          >
            {busy === "all" ? "Menyimpan…" : "Tandai semua dibaca"}
          </button>
        ) : null}
      </div>

      {error ? (
        <div role="status" className="rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {items.length === 0 && !error ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-surface-soft bg-white px-6 py-10 text-center">
          <CircleCheck className="h-6 w-6 text-ink-soft/60" aria-hidden />
          <p className="text-sm font-semibold text-ink">Belum ada notifikasi</p>
          <p className="text-xs text-ink-soft">
            Pemberitahuan kegiatan, pembayaran, donasi, dan absensi akan muncul
            di sini.
          </p>
        </div>
      ) : null}

      <ul className="divide-y divide-surface-soft overflow-hidden rounded-card border border-surface-soft bg-white">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex flex-wrap items-start justify-between gap-3 px-4 py-3 ${
              item.readAt ? "" : "bg-surface-blue/40"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={notificationCategoryTone(item.category)}>
                  {notificationCategoryLabel(item.category)}
                </Badge>
                {!item.readAt ? (
                  <span className="text-[10px] font-bold uppercase text-primary-deep">
                    Belum dibaca
                  </span>
                ) : null}
                <span className="text-xs text-ink-soft/80">
                  {formatDateTimeWib(item.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-ink">{item.title}</p>
              <p className="text-sm text-ink-soft">{item.body}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="rounded-field px-3 py-1.5 text-xs font-semibold text-primary-deep hover:bg-surface-blue"
                >
                  <span className="flex items-center gap-1">
                    Buka
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              ) : null}
              {!item.readAt ? (
                <button
                  type="button"
                  onClick={() => void markRead({ id: item.id }, item.id)}
                  disabled={busy === item.id}
                  aria-label="Tandai dibaca"
                  className="flex items-center gap-1 rounded-field px-2 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-blue hover:text-success disabled:opacity-50"
                >
                  <CircleCheck className="h-3.5 w-3.5" aria-hidden />
                  {busy === item.id ? "..." : "Dibaca"}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
