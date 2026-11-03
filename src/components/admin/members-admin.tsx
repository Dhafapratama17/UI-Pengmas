"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  formatDateWib,
  membershipStatusLabel,
  membershipStatusTone,
} from "@/lib/status-labels";
import type { Profile } from "@/types/db";

interface Notice {
  tone: "success" | "error";
  message: string;
}

interface StatusOption {
  value: string;
  label: string;
  description: string;
}

const statusOptions: StatusOption[] = [
  {
    value: "active",
    label: "Aktif",
    description: "Anggota terverifikasi dan dapat meminjam buku.",
  },
  {
    value: "pending",
    label: "Menunggu verifikasi",
    description: "Menunggu pengecekan data oleh admin.",
  },
  {
    value: "expired",
    label: "Kedaluwarsa",
    description: "Batas keanggotaan terlewati.",
  },
];

export function MembersAdmin({ members }: { members: Profile[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = useState<Profile | null>(null);
  const [status, setStatus] = useState("active");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const closeDialog = () => {
    setTarget(null);
    setNotice(null);
  };

  const openDialog = (member: Profile) => {
    setTarget(member);
    setStatus(member.membershipStatus);
    setNotice(null);
  };

  const submit = async () => {
    setNotice(null);
    setSubmitting(true);
    const res = await fetch(`/api/admin/member/${target?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipStatus: status }),
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
    toast("Status keanggotaan diperbarui.", "success");
    closeDialog();
    router.refresh();
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <Table>
        <THead>
          <TR>
            <TH>Anggota</TH>
            <TH>No. Anggota</TH>
            <TH>Bergabung</TH>
            <TH>Status</TH>
            <TH>Aksi</TH>
          </TR>
        </THead>
        <TBody>
          {members.map((member) => (
            <TR key={member.id}>
              <TD>
                <div className="font-semibold text-ink">{member.fullName}</div>
                <div className="text-xs text-ink-soft">{member.email}</div>
              </TD>
              <TD>{member.memberNo}</TD>
              <TD>{formatDateWib(member.createdAt)}</TD>
              <TD>
                <Badge tone={membershipStatusTone(member.membershipStatus)}>
                  {membershipStatusLabel(member.membershipStatus)}
                </Badge>
              </TD>
              <TD>
                <Button size="sm" variant="secondary" onClick={() => openDialog(member)}>
                  Kelola Status
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Modal
        open={Boolean(target)}
        title={`Status Keanggotaan: ${target?.fullName}`}
        description="Perubahan berlaku untuk akses pinjam buku dan fitur anggota."
        onClose={closeDialog}
      >
        <div className="space-y-3">
          <div className="rounded-field bg-surface-blue px-3 py-2 text-xs text-primary-deep">
            {statusOptions.find((option) => option.value === status)?.description}
          </div>
          <Select
            id="keanggotaan-status"
            label="Status Keanggotaan"
            value={status}
            options={statusOptions.map((o) => ({ value: o.value, label: o.label }))}
            onChange={(e) => setStatus(e.target.value)}
          />
          {notice ? (
            <div
              role="status"
              className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{notice.message}</span>
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={closeDialog}>
            Batal
          </Button>
          <Button loading={submitting} disabled={submitting} onClick={submit}>
            Simpan Status
          </Button>
        </div>
      </Modal>
    </div>
  );
}
