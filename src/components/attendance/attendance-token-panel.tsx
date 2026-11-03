"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCodeImage } from "@/components/attendance/qr-code-image";
import { useToast } from "@/components/ui/toast";
import {
  formatDateTimeWib,
  formatDateWib,
} from "@/lib/status-labels";
import { formatTimeJakarta } from "@/lib/util/format";
import type { AttendanceWindow } from "@/lib/services/qr";

interface TokenState {
  token: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPanelProps {
  activityId: string;
  activityTitle: string;
  startsAt: string;
  endsAt: string;
  initialToken: TokenState | null;
  attendanceWindow: AttendanceWindow;
}

const windowLabel: Record<AttendanceWindow["state"], string> = {
  not_started: "Belum dibuka",
  open: "Terbuka",
  closed: "Sudah ditutup",
};

const windowTone: Record<AttendanceWindow["state"], "info" | "success" | "danger"> = {
  not_started: "info",
  open: "success",
  closed: "danger",
};

export function AttendanceTokenPanel({
  activityId,
  activityTitle,
  startsAt,
  endsAt,
  initialToken,
  attendanceWindow,
}: TokenPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tokenState, setTokenState] = useState<TokenState | null>(initialToken);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refreshToken = async () => {
    setNotice(null);
    setSubmitting(true);
    const res = await fetch(`/api/admin/absensi/${activityId}`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok || !data.ok) {
      setNotice(data.message ?? "Gagal membuat token QR. Coba lagi.");
      return;
    }
    setTokenState({
      token: data.token.token,
      active: data.token.active,
      createdAt: data.token.createdAt,
      updatedAt: data.token.updatedAt,
    });
    toast("Token QR absensi dibuat. Token lama otomatis nonaktif.", "success");
    router.refresh();
  };

  const toggleActive = async () => {
    if (!tokenState) return;
    setNotice(null);
    setSubmitting(true);
    const res = await fetch(`/api/admin/absensi/${activityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !tokenState.active }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok || !data.ok) {
      setNotice(data.message ?? "Gagal memperbarui status token. Coba lagi.");
      return;
    }
    setTokenState((prev) =>
      prev
        ? { ...prev, active: data.token.active, updatedAt: data.token.updatedAt }
        : prev
    );
    toast(
      data.token.active ? "Token QR diaktifkan." : "Token QR dinonaktifkan.",
      data.token.active ? "success" : "warning"
    );
    router.refresh();
  };

  const qrUrl =
    tokenState?.active && typeof window !== "undefined"
      ? `${window.location.origin}/absensi?token=${encodeURIComponent(tokenState.token)}`
      : null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-ink">QR Code Kegiatan</h3>
          <p className="text-xs text-ink-soft">
            {activityTitle} • {formatDateWib(startsAt)} •{" "}
            {formatTimeJakarta(startsAt)}–{formatTimeJakarta(endsAt)} WIB
          </p>
        </div>
        <Badge tone={windowTone[attendanceWindow.state]}>
          Jendela absensi: {windowLabel[attendanceWindow.state]}
        </Badge>
      </div>

      {notice ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-surface-soft bg-surface-blue/40 px-4 py-6">
        {tokenState?.active && qrUrl ? (
          <QrCodeImage
            value={qrUrl}
            size={288}
            label={`QR absensi kegiatan ${activityTitle}`}
          />
        ) : (
          <div className="flex h-72 w-72 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-surface-soft bg-white text-center">
            <CircleAlert className="h-8 w-8 text-ink-soft/60" aria-hidden />
            <p className="text-sm font-semibold text-ink">
              {tokenState ? "Token QR sedang nonaktif" : "Belum ada token QR"}
            </p>
            <p className="max-w-56 text-xs text-ink-soft">
              {tokenState
                ? "Aktifkan token atau buat token baru untuk menampilkan QR."
                : "Buat token QR agar peserta dan relawan dapat check-in."}
            </p>
          </div>
        )}
        {tokenState ? (
          <p className="break-all text-center font-mono text-[10px] text-ink-soft">
            token: {tokenState.token}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" loading={submitting} disabled={submitting} onClick={refreshToken}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          {tokenState ? "Perbarui Token QR" : "Buat Token QR"}
        </Button>
        <Badge tone={tokenState?.active ? "success" : "neutral"}>
          {tokenState?.active ? "Token aktif" : "Token nonaktif"}
        </Badge>
      </div>
      {tokenState ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={tokenState.active ? "danger" : "success"}
            loading={submitting}
            disabled={submitting}
            onClick={toggleActive}
          >
            {tokenState.active ? "Nonaktifkan Token" : "Aktifkan Token"}
          </Button>
          <span className="text-xs text-ink-soft">
            Dibuat {formatDateTimeWib(tokenState.createdAt)} • Diperbarui{" "}
            {formatDateTimeWib(tokenState.updatedAt)}
          </span>
        </div>
      ) : null}

      <p className="text-xs text-ink-soft">
        Token dibuat server-side secara acak dan hanya aktif ke satu kegiatan.
        Membuat token baru menonaktifkan token sebelumnya. Data mode saat ini:
        mock (in-memory) — jalur keamanan sudah divalidasi di server, tetapi
        bukan klaim keamanan produksi.
      </p>
    </div>
  );
}
