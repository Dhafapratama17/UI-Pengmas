import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CalendarDays, Hourglass, MapPin } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import {
  RegistrationStatusBadge,
} from "@/components/activities/registration-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LinkButton } from "@/components/ui/button";
import {
  getActivity,
  getProfileByEmail,
  listRegistrationsForUser,
  listPayments,
} from "@/lib/services";
import {
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";
import {
  formatEventDateJakarta,
  formatRupiah,
  formatTimeJakarta,
} from "@/lib/util/format";

export const metadata: Metadata = { title: "Kegiatan Saya" };

export default async function MemberActivitiesPage() {
  try {
    const cookieStore = await cookies();
    const session = await decodeSessionCookie(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    if (!session) {
      return (
        <ErrorState
          title="Sesi tidak ditemukan"
          description="Masuk kembali sebagai member untuk melihat kegiatan Anda."
        />
      );
    }

    const profile = await getProfileByEmail(session.email);
    const registrations = await listRegistrationsForUser({
      memberId: session.userId,
      email: session.email,
    });
    const payments = await listPayments();

    if (registrations.length === 0) {
      return (
        <div className="space-y-6">
          <SectionTitle
            title="Kegiatan Saya"
            description="Riwayat kegiatan yang Anda ikuti beserta status pendaftarannya."
          />
          <EmptyState
            icon={<CalendarDays aria-hidden />}
            title="Belum ada kegiatan yang diikuti"
            description="Jelajahi daftar kegiatan komunitas dan registrasikan diri Anda pada kegiatan menarik."
            action={
              <LinkButton href="/kegiatan" size="sm">
                Jelajahi kegiatan
              </LinkButton>
            }
          />
        </div>
      );
    }

    const rows = await Promise.all(
      registrations.map(async (registration) => {
        const activity = await getActivity(registration.activityId);
        const payment = payments.find(
          (p) => p.activityRegistrationId === registration.id
        );
        return { registration, activity, payment };
      })
    );

    return (
      <div className="space-y-6">
        <SectionTitle
          title="Kegiatan Saya"
          description={
            profile
              ? `Member: ${profile.fullName}${profile.memberNo ? ` — Nomor ${profile.memberNo}` : ""}`
              : `Kegiatan atas akun ${session.email}`
          }
        />

        <div className="space-y-4">
          {rows.map(({ registration, activity, payment }) =>
            activity ? (
              <Card key={registration.id} className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-ink">{activity.title}</h3>
                    <dl className="mt-1 space-y-1 text-sm text-ink-soft">
                      <dd className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-primary-deep" aria-hidden />
                        {formatEventDateJakarta(activity.startsAt)} • {formatTimeJakarta(activity.startsAt)} WIB
                      </dd>
                      <dd className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary-deep" aria-hidden />
                        {activity.location}
                      </dd>
                    </dl>
                  </div>
                  <RegistrationStatusBadge
                    kind={payment ? "payment" : "free_registered"}
                    paymentStatus={payment?.status}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-soft pt-2 text-xs text-ink-soft">
                  <span>
                    Nomor registrasi:{" "}
                    <span className="font-mono font-semibold text-ink">
                      {registration.reference}
                    </span>
                  </span>
                  {payment ? (
                    <span>
                      Tagihan: {formatRupiah(payment.amount)} •{" "}
                      {payment.method === "qris" ? "QRIS" : "Transfer Bank"}
                      {payment.status === "rejected" &&
                      payment.rejectionReason
                        ? ` — catatan: ${payment.rejectionReason}`
                        : ""}
                    </span>
                  ) : (
                    <span>Tidak memerlukan pembayaran.</span>
                  )}
                </div>
                {payment?.status === "pending" ? (
                  <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <Hourglass className="h-3.5 w-3.5 text-[#E9A23B]" aria-hidden />
                    Bukti pembayaran Anda masih dalam antrean verifikasi admin.
                  </p>
                ) : null}
              </Card>
            ) : null
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Kegiatan Saya" />
        <ErrorState
          title="Riwayat kegiatan tidak dapat dimuat"
          description={
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat riwayat kegiatan."
          }
        />
      </div>
    );
  }
}
