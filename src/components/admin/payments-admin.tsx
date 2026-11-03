"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  formatDateTimeWib,
  formatRupiah,
  paymentStatusLabel,
  paymentStatusTone,
  paymentSubjectLabel,
} from "@/lib/status-labels";
import type { Payment } from "@/types/db";

interface Notice {
  tone: "success" | "error";
  message: string;
}

export function PaymentsAdmin({
  payments,
  subjectDescriptions,
}: {
  payments: Payment[];
  subjectDescriptions: Record<string, string>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = useState<Payment | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const closeDialog = () => {
    setTarget(null);
    setRejectOpen(false);
    setReason("");
    setNotice(null);
  };

  const decide = async (decision: "verified" | "rejected") => {
    setNotice(null);
    setSubmitting(true);
    const res = await fetch(`/api/admin/pembayaran/${target?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision,
        rejectionReason: decision === "rejected" ? reason.trim() : undefined,
      }),
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
    toast(
      decision === "verified"
        ? "Pembayaran ditandai terverifikasi."
        : "Pembayaran ditolak.",
      decision === "verified" ? "success" : "warning"
    );
    closeDialog();
    router.refresh();
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="rounded-card border border-surface-soft bg-white p-8 text-center">
          <CircleCheck className="mx-auto h-8 w-8 text-success" aria-hidden />
          <h3 className="mt-2 text-base font-bold text-primary-deep">
            Tidak ada pembayaran tertunda
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Semua pembayaran sudah melalui verifikasi.
          </p>
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Subjek</TH>
              <TH>Jumlah</TH>
              <TH>Metode</TH>
              <TH>Bukti</TH>
              <TH>Status</TH>
              <TH>Waktu Masuk</TH>
              <TH>Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {payments.map((payment) => (
              <TR key={payment.id}>
                <TD>
                  <div className="font-semibold text-ink">
                    {subjectDescriptions[payment.id] ??
                      paymentSubjectLabel(payment.subject)}
                  </div>
                </TD>
                <TD>{formatRupiah(payment.amount)}</TD>
                <TD>{payment.method === "qris" ? "QRIS" : "Transfer Bank"}</TD>
                <TD className="max-w-40 truncate">
                  <span
                    className="block truncate"
                    title={payment.evidenceUrl ?? ""}
                  >
                    {payment.evidenceUrl ?? "—"}
                  </span>
                </TD>
                <TD>
                  <Badge tone={paymentStatusTone(payment.status)}>
                    {paymentStatusLabel(payment.status)}
                  </Badge>
                  {payment.rejectionReason ? (
                    <div className="text-xs text-danger">
                      {payment.rejectionReason}
                    </div>
                  ) : null}
                </TD>
                <TD>{formatDateTimeWib(payment.createdAt)}</TD>
                <TD>
                  {payment.status === "pending" ? (
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setTarget(payment);
                          setRejectOpen(false);
                          setNotice(null);
                        }}
                      >
                        Verifikasi
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() => {
                          setTarget(payment);
                          setRejectOpen(true);
                          setReason("");
                          setNotice(null);
                        }}
                      >
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-soft">Selesai</span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={Boolean(target) && !rejectOpen}
        title="Verifikasi Pembayaran"
        description={
          target
            ? `${paymentSubjectLabel(target.subject)} • ${formatRupiah(target.amount)} • ${
                subjectDescriptions[target.id] ?? ""
              }`
            : undefined
        }
        onClose={closeDialog}
      >
        <p className="text-sm text-ink-soft">
          Pastikan bukti transfer sesuai sebelum menyetujui. Bukti tersimpan pada
          jalur mock dan tidak menampilkan gambar riil.
        </p>
        {notice ? (
          <div
            role="status"
            className="mt-3 flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
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
            variant="success"
            loading={submitting}
            disabled={submitting}
            onClick={() => decide("verified")}
          >
            Tandai Terverifikasi
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(target) && rejectOpen}
        title="Tolak Pembayaran"
        description="Alasan penolakan wajib diisi (minimal 5 karakter) dan akan ditampilkan pada status pendaftar/donatur."
        onClose={closeDialog}
      >
        <Textarea
          id="alasan-tolak"
          label="Alasan Penolakan"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {notice ? (
          <div
            role="status"
            className="mt-3 flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
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
            variant="danger"
            loading={submitting}
            disabled={submitting}
            onClick={() => decide("rejected")}
          >
            Tolak Pembayaran
          </Button>
        </div>
      </Modal>
    </div>
  );
}
