"use client";

import { useState } from "react";
import { Bell, CalendarDays, Search, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

const palette = [
  { name: "Primary Blue", value: "#1976D2", className: "bg-primary" },
  { name: "Deep Blue", value: "#1557A0", className: "bg-primary-deep" },
  { name: "Light Blue", value: "#E8F4FF", className: "bg-surface-blue" },
  { name: "Soft Blue", value: "#D5EAFE", className: "bg-surface-soft" },
  { name: "Background", value: "#F5F9FE", className: "bg-surface" },
  { name: "Text Primary", value: "#20334A", className: "bg-ink" },
  { name: "Text Secondary", value: "#64748B", className: "bg-ink-soft" },
  { name: "Success", value: "#198754", className: "bg-success" },
  { name: "Warning", value: "#E9A23B", className: "bg-warning" },
  { name: "Error", value: "#DC3545", className: "bg-danger" },
];

export default function DesignReviewPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-10">
      <SectionTitle
        title="Design Review — Pemeriksaan Fase 2"
        description="Halaman pemeriksaan internal: palet, tipografi, komponen, state, dan shell. Tidak diarahkan untuk pengguna akhir."
      />

      <section>
        <h3 className="mb-3 text-sm font-bold text-ink">Palet warna (§3.2)</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {palette.map((color) => (
            <div
              key={color.name}
              className="rounded-field border border-surface-soft bg-white p-2 text-center"
            >
              <div className={`mx-auto h-10 w-full rounded-field ${color.className}`} />
              <p className="mt-2 text-xs font-semibold text-ink">{color.name}</p>
              <p className="text-[10px] text-ink-soft">{color.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold text-ink">
          Hierarki tipografi (§3.3)
        </h3>
        <Card className="space-y-2">
          <p className="text-3xl font-extrabold text-primary-deep">
            Heading Utama — 30px bold
          </p>
          <p className="text-xl font-bold text-ink">Section Heading — 20px bold</p>
          <p className="text-base text-ink">
            Body text — nyaman dibaca di layar kecil, medium weight untuk kontrol.
          </p>
          <p className="text-sm text-ink-soft">
            Metadata — lebih kecil tapi tetap aksesibel.
          </p>
          <p className="text-xs text-ink-soft">
            Label kecil 12px untuk badge dan hint.
          </p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-ink">Tombol (semua varian)</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Bahaya</Button>
            <Button variant="success">Verifikasi</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Kecil</Button>
            <Button size="md">Sedang</Button>
            <Button size="lg">Besar</Button>
            <Button disabled aria-label="Tombol nonaktif">Disabled</Button>
            <Button
              loading={loadingDemo}
              onClick={() => {
                setLoadingDemo(true);
                setTimeout(() => setLoadingDemo(false), 900);
              }}
            >
              Contoh proses
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">Info</Badge>
            <Badge tone="success">Sukses</Badge>
            <Badge tone="warning">Menunggu</Badge>
            <Badge tone="danger">Ditolak</Badge>
            <Badge tone="neutral">Netral</Badge>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-ink">Form dan input</h3>
          <Input
            id="review-search"
            label="Cari"
            placeholder="Cari buku…"
            leadingIcon={<Search className="h-4 w-4" aria-hidden />}
          />
          <Input
            id="review-error"
            label="Input dengan error"
            defaultValue="contoh"
            error="Format tidak sesuai — cek kembali."
          />
          <Select
            id="review-select"
            label="Dropdown"
            options={[
              { value: "a", label: "Pilihan A" },
              { value: "b", label: "Pilihan B" },
            ]}
          />
          <Textarea
            id="review-textarea"
            label="Textarea"
            hint="Catatan opsional maksimum 500 karakter."
          />
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-ink">Dialog & toast</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setConfirmOpen(true)}>Buka dialog</Button>
            <Button
              variant="success"
              onClick={() => toast("Status tersimpan.", "success")}
            >
              Toast sukses
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast("Suatu tindakan mendekati tenggat.", "warning")}
            >
              Toast peringatan
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast("Server tidak dapat dihubungi.", "error")}
            >
              Toast error
            </Button>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-ink">Statistik & ikon</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Buku" value={12} icon={<ShieldCheck className="h-5 w-5" aria-hidden />} />
            <StatCard label="Pengunjung" value={9} icon={<Users className="h-5 w-5" aria-hidden />} />
            <StatCard label="Kegiatan" value={6} icon={<CalendarDays className="h-5 w-5" aria-hidden />} />
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-ink">Tabel</h3>
        <Table>
          <THead>
            <TH>Kolom A</TH>
            <TH>Status</TH>
            <TH>Aksi</TH>
          </THead>
          <TBody>
            <TR>
              <TD>Ayakan pertama</TD>
              <TD><Badge tone="warning">Menunggu</Badge></TD>
              <TD><Button size="sm" variant="secondary">Tinjau</Button></TD>
            </TR>
            <TR>
              <TD>Baris kedua</TD>
              <TD><Badge tone="success">Terverifikasi</Badge></TD>
              <TD><Button size="sm" variant="secondary">Lihat</Button></TD>
            </TR>
          </TBody>
        </Table>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <EmptyState
          icon={<Bell aria-hidden />}
          title="Contoh empty state"
          description="Teks bantuan menjelaskan mengapa data belum ada."
        />
        <ErrorState
          onRetry={() => toast("Percobaan ulang dikirim.", "info")}
          description="Error state dengan tombol coba kembali."
        />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">Skeleton loading</p>
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-2/3" />
        </div>
      </section>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Contoh dialog konfirmasi"
        description="Digunakan untuk aksi sensitif/destruktif sesuai §13.3."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setConfirmOpen(false);
                toast("Aksi dikonfirmasi.", "success");
              }}
            >
              Konfirmasi
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink">
          Konten dialog. Tertutup dengan tombol X, klik overlay, atau Escape.
        </p>
      </Modal>

      <p className="text-center text-xs text-ink-soft">
        Uji juga: sidebar buka/tutup (mobile drawer & desktop collapsible),
        highlight menu aktif, notifikasi dropdown.
      </p>
    </div>
  );
}
