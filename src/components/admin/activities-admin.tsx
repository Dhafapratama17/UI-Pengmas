"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card, SectionTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  activityStatusLabel,
  activityStatusTone,
  formatDateTimeWib,
} from "@/lib/status-labels";
import type { Activity } from "@/types/db";

type DialogMode = "create" | "edit" | "delete" | null;

interface Notice {
  tone: "success" | "error";
  message: string;
}

interface FormState {
  title: string;
  description: string;
  posterUrl: string;
  startsAt: string;
  endsAt: string;
  location: string;
  organizer: string;
  feeAmount: string;
  capacity: string;
  registrationDeadline: string;
  status: string;
}

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    posterUrl: "",
    startsAt: "",
    endsAt: "",
    location: "",
    organizer: "",
    feeAmount: "0",
    capacity: "20",
    registrationDeadline: "",
    status: "published",
  };
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTime() - date.getTimezoneOffset() * 60000;
  return new Date(offset).toISOString().slice(0, 16);
}

function formForActivity(activity: Activity): FormState {
  return {
    title: activity.title,
    description: activity.description,
    posterUrl: activity.posterUrl ?? "",
    startsAt: toLocalInput(activity.startsAt),
    endsAt: toLocalInput(activity.endsAt),
    location: activity.location,
    organizer: activity.organizer,
    feeAmount: String(activity.feeAmount),
    capacity: String(activity.capacity),
    registrationDeadline: toLocalInput(activity.registrationDeadline),
    status: activity.status,
  };
}

export function ActivitiesAdmin({ activities }: { activities: Activity[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [target, setTarget] = useState<Activity | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const closeDialog = () => {
    setDialog(null);
    setTarget(null);
  };

  const send = async (
    url: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown
  ) => {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setNotice({
        tone: "error",
        message: data.message ?? "Tidak dapat menghubungi server. Coba lagi.",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setNotice(null);
    setSubmitting(true);
    const payload = {
      title: form.title,
      description: form.description,
      posterUrl: form.posterUrl || null,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      location: form.location,
      organizer: form.organizer,
      feeAmount: Number(form.feeAmount),
      capacity: Number(form.capacity),
      registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      status: form.status,
    };
    const ok =
      dialog === "create"
        ? await send("/api/admin/kegiatan", "POST", payload)
        : await send(
            `/api/admin/kegiatan/${target?.id}`,
            "PATCH",
            payload
          );
    if (ok) {
      toast("Data kegiatan berhasil disimpan.", "success");
      closeDialog();
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    const ok = await send(`/api/admin/kegiatan/${target?.id}`, "DELETE");
    if (ok) {
      toast("Kegiatan berhasil dihapus.", "success");
      closeDialog();
      router.refresh();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Total {activities.length} kegiatan (termasuk draf/arsip).
        </p>
        <Button
          onClick={() => {
            setForm(emptyForm());
            setTarget(null);
            setNotice(null);
            setDialog("create");
          }}
        >
          + Tambah Kegiatan
        </Button>
      </div>

      {activities.length === 0 ? (
        <Card>
          <SectionTitle
            title="Belum ada kegiatan"
            description="Tambahkan kegiatan pertama dengan tombol di atas."
          />
        </Card>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Kegiatan</TH>
              <TH>Mulai</TH>
              <TH>Biaya</TH>
              <TH>Kuota</TH>
              <TH>Status</TH>
              <TH>Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {activities.map((activity) => (
              <TR key={activity.id}>
                <TD>
                  <a
                    href={`/admin/kegiatan/${activity.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {activity.title}
                  </a>
                  <div className="text-xs text-ink-soft">
                    {activity.location}
                  </div>
                </TD>
                <TD>{formatDateTimeWib(activity.startsAt)}</TD>
                <TD>{activity.feeAmount > 0 ? `Rp ${activity.feeAmount.toLocaleString("id-ID")}` : "Gratis"}</TD>
                <TD>{activity.capacity}</TD>
                <TD>
                  <Badge tone={activityStatusTone(activity.status)}>
                    {activityStatusLabel(activity.status)}
                  </Badge>
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setForm(formForActivity(activity));
                        setTarget(activity);
                        setNotice(null);
                        setDialog("edit");
                      }}
                    >
                      Edit
                    </Button>
                    <a
                      href={`/admin/kegiatan/${activity.id}`}
                      className="inline-flex items-center rounded-field px-3 py-1.5 text-xs font-semibold text-primary-deep hover:bg-surface-blue"
                    >
                      Peserta
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => {
                        setTarget(activity);
                        setNotice(null);
                        setDialog("delete");
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={dialog === "create" || dialog === "edit"}
        title={
          dialog === "create"
            ? "Tambah Kegiatan"
            : `Edit Kegiatan: ${target?.title}`
        }
        description="Tanggal memakai waktu lokal perangkat dan disimpan sebagai ISO (UTC)."
        onClose={closeDialog}
      >
        <div className="space-y-3">
          <Input
            id="kegiatan-judul"
            label="Judul Kegiatan"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <Textarea
            id="kegiatan-deskripsi"
            label="Deskripsi"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <Input
            id="kegiatan-poster"
            label="URL Poster"
            hint="Kosongkan jika belum tersedia."
            value={form.posterUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, posterUrl: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="kegiatan-mulai"
              label="Waktu Mulai"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, startsAt: e.target.value }))
              }
            />
            <Input
              id="kegiatan-selesai"
              label="Waktu Selesai"
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, endsAt: e.target.value }))
              }
            />
          </div>
          <Input
            id="kegiatan-lokasi"
            label="Lokasi"
            value={form.location}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, location: e.target.value }))
            }
          />
          <Input
            id="kegiatan-organizer"
            label="Penanggung Jawab / Koordinator"
            value={form.organizer}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, organizer: e.target.value }))
            }
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              id="kegiatan-biaya"
              label="Biaya (Rp)"
              type="number"
              min={0}
              value={form.feeAmount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, feeAmount: e.target.value }))
              }
            />
            <Input
              id="kegiatan-kuota"
              label="Kuota Peserta"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, capacity: e.target.value }))
              }
            />
            <Input
              id="kegiatan-batas"
              label="Batas Pendaftaran"
              type="datetime-local"
              value={form.registrationDeadline}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  registrationDeadline: e.target.value,
                }))
              }
            />
          </div>
          <Select
            id="kegiatan-status"
            label="Status Rilis"
            value={form.status}
            options={[
              { value: "published", label: "Terbit (tampil publik)" },
              { value: "draft", label: "Draf (belum tampil)" },
              { value: "closed", label: "Ditutup" },
              { value: "archived", label: "Arsip" },
            ]}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value }))
            }
          />
          {notice ? (
            <div
              role="status"
              className={`flex items-start gap-2 rounded-field border px-3 py-2.5 text-xs ${
                notice.tone === "success"
                  ? "border-success/30 bg-green-50 text-success"
                  : "border-danger/30 bg-red-50 text-danger"
              }`}
            >
              {notice.tone === "success" ? (
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              <span>{notice.message}</span>
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={closeDialog}>
            Batal
          </Button>
          <Button loading={submitting} disabled={submitting} onClick={handleSave}>
            Simpan Kegiatan
          </Button>
        </div>
      </Modal>

      <Modal
        open={dialog === "delete"}
        title="Hapus Kegiatan"
        description={`"${target?.title}" akan dihapus. Kegiatan dengan data pendaftaran, penugasan relawan, atau absensi tidak dapat dihapus; gunakan status arsip.`}
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
            variant="danger"
            loading={submitting}
            disabled={submitting}
            onClick={handleDelete}
          >
            Hapus Permanen
          </Button>
        </div>
      </Modal>
    </div>
  );
}
