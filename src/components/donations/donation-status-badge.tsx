import type { DonationStatus, PaymentStatus } from "@/types/db";

export type DonationStatusBadgeProps =
  | { kind: "financial"; paymentStatus: PaymentStatus | null }
  | { kind: "physical"; donationStatus: DonationStatus };

const styles = {
  warning:
    "border-primary/40 bg-amber-50 text-[#8a6414]",
  success:
    "border-success/30 bg-green-50 text-success",
  danger:
    "border-danger/30 bg-red-50 text-danger",
} as const;

function financialContent(paymentStatus: PaymentStatus | null): {
  tone: keyof typeof styles;
  icon: string;
  label: string;
} {
  if (paymentStatus === "verified")
    return { tone: "success", icon: "✓", label: "Terverifikasi & Diterima Bendahara ReteMali" };
  if (paymentStatus === "rejected")
    return { tone: "danger", icon: "!", label: "Ditolak — Periksa Catatan Admin" };
  return { tone: "warning", icon: "⏳", label: "Menunggu Verifikasi Admin" };
}

function physicalContent(donationStatus: DonationStatus): {
  tone: keyof typeof styles;
  icon: string;
  label: string;
} {
  if (donationStatus === "confirmed" || donationStatus === "fulfilled")
    return { tone: "success", icon: "✓", label: "Diterima ReteMali" };
  if (donationStatus === "rejected")
    return { tone: "danger", icon: "!", label: "Dibatalkan" };
  return { tone: "warning", icon: "⇢", label: "Menunggu Kedatangan Donatur (Drop-off)" };
}

export function DonationStatusBadge(props: DonationStatusBadgeProps) {
  const content =
    props.kind === "financial"
      ? financialContent(props.paymentStatus)
      : physicalContent(props.donationStatus);

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles[content.tone]}`}
    >
      <span aria-hidden>{content.icon}</span>
      {content.label}
    </span>
  );
}
