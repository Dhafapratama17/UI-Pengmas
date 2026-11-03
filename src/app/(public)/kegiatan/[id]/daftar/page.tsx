import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RegistrationForm } from "@/components/activities/registration-form";
import {
  describeRegistrationSummary,
  getActivity,
} from "@/lib/services";
import { getProfileByEmail } from "@/lib/services/members";
import { getSiteSettings } from "@/lib/services/settings";
import {
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";
import {
  formatEventDateJakarta,
  formatTimeJakarta,
} from "@/lib/util/format";

export const metadata: Metadata = { title: "Formulir Pendaftaran Kegiatan" };

export default async function ActivityRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity || activity.status !== "published") notFound();

  const summary = await describeRegistrationSummary(activity, new Date());
  if (summary.window !== "open") notFound();

  const cookieStore = await cookies();
  const session = await decodeSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
  const profile = session
    ? await getProfileByEmail(session.email)
    : null;
  const settings = await getSiteSettings();

  const schedule = `${formatEventDateJakarta(activity.startsAt)} • ${formatTimeJakarta(activity.startsAt)} WIB`;

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-0 lg:px-0">
      <div>
        <Link
          href={`/kegiatan/${activity.id}`}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke detail kegiatan
        </Link>
        <h1 className="text-xl font-bold text-primary-deep">
          Formulir Pendaftaran Kegiatan
        </h1>
      </div>

      <Card>
        <RegistrationForm
          activityId={activity.id}
          activityTitle={activity.title}
          activitySchedule={schedule}
          activityLocation={activity.location}
          feeAmount={activity.feeAmount}
          prefillName={session?.fullName ?? null}
          prefillEmail={session?.email ?? null}
          memberMode={Boolean(session && profile?.role === "member")}
          memberNumber={profile?.memberNo ?? null}
          paymentInstructions={{
            qrisImageUrl: settings.qrisImageUrl,
            bankName: settings.bankName,
            bankAccountNumber: settings.bankAccountNumber,
            bankAccountHolder: settings.bankAccountHolder,
          }}
        />
      </Card>
    </div>
  );
}
