import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  listActivities,
  listBooks,
  getSiteSettings,
  describeRegistrationSummary,
} from "@/lib/services";

export const metadata = { title: "Beranda" };

function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export default async function BerandaPage() {
  const popular = await listBooks({ sort: "popular", pageSize: 4 });
  const activities = await listActivities({
    upcomingOnly: true,
    now: new Date("2026-10-30"),
  });
  const settings = await getSiteSettings();
  const topActivities = activities.slice(0, 3);
  const upcomingSummaries = await Promise.all(
    topActivities.map((a) => describeRegistrationSummary(a, new Date("2026-10-30")))
  );

  const settingsMissing = [
    settings.address,
    settings.mapsUrl,
    settings.instagramUrl,
    settings.phone,
    settings.email,
  ].every((value) => value === null);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-card border border-surface-soft bg-surface-blue/60 p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-8">
        <Image
          src="/images/retemali-logo.png"
          alt="Logo Taman Baca ReteMali"
          width={120}
          height={82}
          className="h-auto w-24 object-contain lg:w-28"
          priority
        />
        <div>
          <h1 className="text-2xl font-extrabold text-primary-deep lg:text-3xl">
            Ruang belajar, membaca, dan bertumbuh bersama
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft lg:text-base">
            ReteMali hadir untuk masyarakat melalui katalog buku, kegiatan
            literasi komunitas, dan jalur donasi yang terbuka.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/katalog">Jelajahi Buku</LinkButton>
          <LinkButton href="/kegiatan" variant="secondary">
            Lihat Kegiatan
          </LinkButton>
        </div>
      </section>

      <section>
        <SectionTitle
          title="Koleksi Buku Terpopuler"
          description="Penggunaan data nyata dari service layer (mode mock aktif)."
          action={
            <LinkButton href="/katalog" variant="secondary" size="sm">
              Lihat Semua Buku
            </LinkButton>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.items.map((book) => (
            <Card key={book.id} padded={false} className="overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-surface-soft/60 text-4xl font-extrabold text-primary-deep/70">
                {book.title.charAt(0)}
              </div>
              <div className="space-y-1.5 p-4">
                <p className="truncate font-bold text-ink">{book.title}</p>
                <p className="truncate text-sm text-ink-soft">{book.author}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {book.availableCopies > 0 ? (
                    <Badge tone="success">
                      Tersedia {book.availableCopies}
                    </Badge>
                  ) : (
                    <Badge tone="danger">Tidak tersedia</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title="Kegiatan Terdekat"
          description="Menampilkan kegiatan terpublikasi terdekat."
          action={
            <LinkButton href="/kegiatan" variant="secondary" size="sm">
              Lihat Kegiatan
            </LinkButton>
          }
        />
        {topActivities.length === 0 ? (
          <EmptyState
            title="Belum ada kegiatan terdekat"
            description="Kegiatan tampil di sini begitu admin mempublikasikannya."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {topActivities.map((activity, index) => {
              const summary = upcomingSummaries[index];
              return (
                <Card key={activity.id}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-ink">{activity.title}</p>
                    <Badge tone={summary.isFree ? "success" : "warning"}>
                      {summary.isFree ? "Gratis" : "Berbayar"}
                    </Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
                    <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                    {formatEventDate(activity.startsAt)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    {activity.location}
                  </p>
                  <p className="mt-3 text-xs text-ink-soft">
                    Kuota sisa: {summary.slotsLeft}/{activity.capacity}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-surface-blue/60">
          <h3 className="font-bold text-primary-deep">Donasi Finansial</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Dukungan literasi melalui QRIS atau transfer bank resmi — detail
            instruksinya diisi admin lewat menu Pengaturan Website.
          </p>
          <LinkButton href="/donasi" size="sm" className="mt-3">
            Lihat Halaman Donasi
          </LinkButton>
        </Card>
        <Card className="bg-surface-blue/60">
          <h3 className="font-bold text-primary-deep">Donasi Buku Fisik</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Buku diserahkan langsung (drop-off) di Taman Baca ReteMali sesuai
            jadwal yang dipilih.
          </p>
          <LinkButton href="/donasi" size="sm" variant="secondary" className="mt-3">
            Ketahui Cara Drop-Off
          </LinkButton>
        </Card>
      </section>

      <section>
        <SectionTitle
          title="Lokasi dan Kontak"
          description="Informasi resmi organisasi — bersumber dari tabel site_settings."
          action={
            settingsMissing ? <Badge tone="warning">Data belum diisi admin</Badge> : undefined
          }
        />
        {settingsMissing ? (
          <EmptyState
            title="Kontak dan alamat belum tersedia"
            description="Alamat, peta, Instagram, telepon, dan email akan ditampilkan setelah admin mengisinya melalui Pengaturan Website (Fase 8). Kontak resmi tidak boleh dikarang."
          />
        ) : null}
      </section>
      <p className="text-center text-xs text-ink-soft">
        Peta halaman ini mengikuti design (4).md §7 dan route §17.
      </p>
    </div>
  );
}
