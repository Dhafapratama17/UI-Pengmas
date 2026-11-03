"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleAlert, MapPin, QrCode, ScanLine } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  formatActivityWindow,
  formatTimeJakarta,
} from "@/lib/util/format";
import { formatDateTimeWib } from "@/lib/status-labels";

export interface CheckinPageProps {
  token: string;
  preflight:
    | { state: "invalid_token"; message: string }
    | { state: "activity_unavailable"; message: string }
    | {
        state: "valid";
        activity: { id: string; title: string; location: string; startsAt: string; endsAt: string };
        windowState: "not_started" | "open" | "closed";
        opensAt: string;
        closesAt: string;
      };
}

interface Notice {
  tone: "success" | "warning" | "error";
  message: string;
}

const windowTone: Record<"not_started" | "open" | "closed", BadgeTone> = {
  not_started: "info",
  open: "success",
  closed: "danger",
};

const windowLabel = {
  not_started: "Belum dibuka",
  open: "Terbuka",
  closed: "Ditutup",
};

export function MemberCheckinPanel({ token, preflight }: CheckinPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const checkIn = async () => {
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/absensi/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      setNotice({
        tone: data.ok ? "success" : data.status === "already_checked_in" ? "warning" : "error",
        message: data.message ?? "Tidak dapat menghubungi server. Coba lagi.",
      });
      if (data.ok) {
        setDone(true);
        toast("Check-in berhasil. Kehadiran Anda tercatat.", "success");
        router.refresh();
      }
    } catch {
      setNotice({
        tone: "error",
        message: "Tidak dapat menghubungi server. Coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (preflight.state === "invalid_token") {
    return (
      <NoticeBlock
        title="QR absensi tidak valid"
        message={preflight.message}
        tone="error"
      />
    );
  }
  if (preflight.state === "activity_unavailable") {
    return (
      <NoticeBlock
        title="Kegiatan tidak tersedia"
        message={preflight.message}
        tone="error"
      />
    );
  }

  const { activity, windowState, opensAt, closesAt } = preflight;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-primary-deep">{activity.title}</h2>
        <Badge tone={windowTone[windowState]}>
          Absensi {windowLabel[windowState]}
        </Badge>
      </div>

      <dl className="space-y-2 text-sm text-ink-soft">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <dt className="sr-only">Detail jadwal</dt>
          <dd>
            <span className="font-semibold text-ink">{activity.location}</span>
            <br />
            {formatActivityWindow(activity.startsAt, activity.endsAt)} WIB
          </dd>
        </div>
        <p className="text-xs">
          Jendela validasi: {formatDateTimeWib(opensAt)} s.d.
          {" "}
          {formatDateTimeWib(closesAt)} — divalidasi di server.
        </p>
      </dl>

      <Button
        size="lg"
        className="w-full"
        disabled={submitting || windowState !== "open" || done}
        loading={submitting}
        onClick={checkIn}
      >
        <QrCode className="h-5 w-5" aria-hidden />
        {done ? "Check-in Tercatat" : "Check-in Sekarang"}
      </Button>

      {notice ? (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-field border px-3 py-3 text-sm ${
            notice.tone === "success"
              ? "border-success/30 bg-green-50 text-success"
              : notice.tone === "warning"
                ? "border-warning/30 bg-amber-50 text-ink"
                : "border-danger/30 bg-red-50 text-danger"
          }`}
        >
          {notice.tone === "success" ? (
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          ) : (
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          )}
          <span>{notice.message}</span>
        </div>
      ) : null}

      <p className="flex items-start gap-2 text-xs text-ink-soft">
        <ScanLine className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Check-in divalidasi server: member harus terdaftar pada kegiatan,
        relawan harus bertugas; duplikasi absensi ditolak.
      </p>
    </div>
  );
}

function NoticeBlock({
  title,
  message,
  tone,
}: {
  title: string;
  message: string;
  tone: "warning" | "error";
}) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-card border px-4 py-5 ${
        tone === "error"
          ? "border-danger/30 bg-red-50 text-danger"
          : "border-warning/30 bg-amber-50 text-ink"
      }`}
    >
      {tone === "error" ? (
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      ) : (
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      )}
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm">{message}</p>
        <p className="mt-2 text-xs opacity-80">
          Waktu scan terakhir: {formatTimeJakarta(new Date().toISOString())} WIB
        </p>
      </div>
    </div>
  );
}
