"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  donationStatusLabel,
  donationStatusTone,
  formatDateWib,
} from "@/lib/status-labels";
import type { Donation, DonationStatus } from "@/types/db";

interface Notice {
  tone: "success" | "error";
  message: string;
}

interface Action {
  status: DonationStatus;
  title: string;
  description: string;
  variant: "primary" | "danger";
}

export function PhysicalDonationsAdmin({
  donations,
}: {
  donations: Donation[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = useState<Donation | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const closeDialog = () => {
    setTarget(null);
    setAction(null);
    setNotice(null);
  };

  const allowedActions: Record<string, Action[]> = {
    pending: [
      {
        status: "confirmed",
        title: "Terima Donasi (Drop-off)",
        description:
          "Tandai setelah donor menyerahkan buku langsung ke perpustakaan. Penyerahan via kurir tidak tersedia.",
        variant: "primary",
      },
      {
        status: "rejected",
        title: "Tolak Pengajuan",
        description: "Pengajuan ditandai tidak diterima; tetap tercatat pada riwayat.",
        variant: "danger",
      },
    ],
    confirmed: [
      {
        status: "fulfilled",
        title: "Tandai Diproses",
        description: "Gunakan setelah buku selesai diseleksi dan didata ke katalog/arsip.",
        variant: "primary",
      },
    ],
    rejected: [],
    fulfilled: [],
  };

  const submit = async () => {
    setNotice(null);
    setSubmitting(true);
    const res = await fetch(`/api/admin/donasi/buku/${target?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action?.status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setNotice({
        tone: "error",
        message: data.message ?? "Tidak dapat menghubungi server. Coba lagi.",
      });
      setSubmitting(false);
      return;
    }
    toast("Status donasi buku diperbarui.", "success");
    closeDialog();
    router.refresh();
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {donations.length === 0 ? (
        <p className="text-sm text-ink-soft">Belum ada pengajuan donasi buku.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Referensi</TH>
              <TH>Donatur</TH>
              <TH>Buku</TH>
              <TH>Jadwal Drop-off</TH>
              <TH>Status</TH>
              <TH>Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {donations.map((donation) => (
              <TR key={donation.id}>
                <TD className="font-semibold text-ink">{donation.reference}</TD>
                <TD>
                  <div className="text-sm text-ink">{donation.donorName}</div>
                  <div className="text-xs text-ink-soft">
                    {donation.donorEmail} • {donation.donorPhone}
                  </div>
                </TD>
                <TD>
                  <div>{donation.bookCount} buku</div>
                  <div className="max-w-56 truncate text-xs text-ink-soft" title={donation.bookTitles ?? ""}>
                    {donation.bookTitles}
                  </div>
                  <div className="text-xs text-ink-soft">{donation.bookCondition}</div>
                </TD>
                <TD>
                  {donation.dropOffAt ? formatDateWib(donation.dropOffAt) : "—"}
                </TD>
                <TD>
                  <Badge tone={donationStatusTone(donation.status)}>
                    {donationStatusLabel(donation.status)}
                  </Badge>
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1.5">
                    {(allowedActions[donation.status] ?? []).map((item) => (
                      <Button
                        key={item.status}
                        size="sm"
                        variant={item.variant === "danger" ? "ghost" : "secondary"}
                        className={item.variant === "danger" ? "text-danger" : ""}
                        onClick={() => {
                          setTarget(donation);
                          setAction(item);
                          setNotice(null);
                        }}
                      >
                        {item.title}
                      </Button>
                    ))}
                    {(allowedActions[donation.status] ?? []).length === 0 ? (
                      <span className="text-xs text-ink-soft">Selesai</span>
                    ) : null}
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={Boolean(target) && Boolean(action)}
        title={`${action?.title ?? ""}: ${target?.reference}`}
        description={action?.description}
        onClose={closeDialog}
      >
        {notice ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{notice.message}</span>
          </div>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={closeDialog}>
            Batal
          </Button>
          <Button
            variant={action?.variant === "danger" ? "danger" : "primary"}
            loading={submitting}
            disabled={submitting}
            onClick={submit}
          >
            Ya, Lanjutkan
          </Button>
        </div>
      </Modal>
    </div>
  );
}
