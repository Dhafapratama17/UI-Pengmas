import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { FinancialDonationForm } from "@/components/donations/financial-donation-form";
import { getSiteSettings } from "@/lib/services";

export const metadata: Metadata = { title: "Donasi Finansial" };

export default async function DonasiUangPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <Link
        href="/donasi"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke pilihan donasi
      </Link>
      <SectionTitle
        title="Donasi Finansial"
        description="Data donatur dicatat untuk konfirmasi & pengecekan status; bukti transfer diverifikasi admin."
      />
      <Card className="p-0">
        <div className="p-6">
          <FinancialDonationForm
            payment={{
              qrisImageUrl: settings.qrisImageUrl,
              bankName: settings.bankName,
              bankAccountNumber: settings.bankAccountNumber,
              bankAccountHolder: settings.bankAccountHolder,
              donationInstructions: settings.donationInstructions,
            }}
            prefillName={null}
            prefillEmail={null}
          />
        </div>
      </Card>
    </div>
  );
}
