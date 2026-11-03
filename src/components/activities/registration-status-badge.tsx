import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/types/db";

export interface ActivityStatusInfo {
  kind: "free_registered" | "payment";
  paymentStatus?: PaymentStatus;
}

export function RegistrationStatusBadge({
  kind,
  paymentStatus,
}: ActivityStatusInfo) {
  if (kind === "free_registered") {
    return <Badge tone="success">Terdaftar (Gratis)</Badge>;
  }
  switch (paymentStatus) {
    case "verified":
      return <Badge tone="success">Pembayaran Terverifikasi</Badge>;
    case "rejected":
      return <Badge tone="danger">Pembayaran Ditolak</Badge>;
    default:
      return <Badge tone="warning">Menunggu Verifikasi Admin</Badge>;
  }
}
