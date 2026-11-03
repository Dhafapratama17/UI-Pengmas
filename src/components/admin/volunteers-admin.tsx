"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { formatDateWib, volunteerApprovalLabel, volunteerApprovalTone } from "@/lib/status-labels";
import type { Profile } from "@/types/db";

interface Notice {
  tone: "success" | "error";
  message: string;
}

export function VolunteersAdmin({ volunteers }: { volunteers: Profile[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = useState<Profile | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const closeDialog = () => {
    setTarget(null);
    setNotice(null);
  };

  const submit = async () => {
    setNotice(null);
    setSubmitting(true);
    const res = await fetch(`/api/admin/volunteer/${target?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approval: decision === "approve" ? "approved" : "rejected" }),
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
      decision === "approve"
        ? "Relawan disetujui; akun dapat masuk ke dashboard relawan."
        : "Pengajuan relawan ditolak.",
      decision === "approve" ? "success" : "warning"
    );
    closeDialog();
    router.refresh();
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <Table>
        <THead>
          <TR>
            <TH>Nama</TH>
            <TH>Role Saat Ini</TH>
            <TH>Bergabung</TH>
            <TH>Status Persetujuan</TH>
            <TH>Aksi</TH>
          </TR>
        </THead>
        <TBody>
          {volunteers.map((volunteer) => (
            <TR key={volunteer.id}>
              <TD>
                <div className="font-semibold text-ink">{volunteer.fullName}</div>
                <div className="text-xs text-ink-soft">{volunteer.email}</div>
              </TD>
              <TD className="text-xs text-ink-soft">
                {volunteer.role === "admin"
                  ? "Admin"
                  : volunteer.role === "volunteer"
                    ? "Relawan"
                    : "Member"}
              </TD>
              <TD>{formatDateWib(volunteer.createdAt)}</TD>
              <TD>
                <Badge tone={volunteerApprovalTone(volunteer.volunteerApprovalStatus)}>
                  {volunteerApprovalLabel(volunteer.volunteerApprovalStatus)}
                </Badge>
              </TD>
              <TD>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="success"
                    disabled={volunteer.volunteerApprovalStatus === "approved"}
                    onClick={() => {
                      setTarget(volunteer);
                      setDecision("approve");
                      setNotice(null);
                    }}
                  >
                    Setujui
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    disabled={volunteer.volunteerApprovalStatus === "rejected"}
                    onClick={() => {
                      setTarget(volunteer);
                      setDecision("reject");
                      setNotice(null);
                    }}
                  >
                    Tolak
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Modal
        open={Boolean(target)}
        title={
          decision === "approve"
            ? `Setujui Relawan: ${target?.fullName}`
            : `Tolak Pengajuan: ${target?.fullName}`
        }
        description={
          decision === "approve"
            ? "Akun dengan role member akan diubah menjadi relawan dan dapat mengakses dashboard relawan."
            : "Pengajuan tidak disetujui; akun tetap dapat mengakses fitur member."
        }
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
            variant={decision === "approve" ? "success" : "danger"}
            loading={submitting}
            disabled={submitting}
            onClick={submit}
          >
            {decision === "approve" ? "Setujui" : "Tolak Pengajuan"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
