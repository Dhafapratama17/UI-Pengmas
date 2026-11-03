import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function SectionPlaceholder({
  title,
  description,
  phase,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  phase: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle
        title={title}
        description={description}
        action={<Badge tone="info">Menunggu {phase}</Badge>}
      />
      <EmptyState
        title="Rute sudah aktif di shell — fitur menyusul"
        description="Semua menu pada sidebar membuka rute nyata (tidak ada dead link). Fungsionalitas penuh ditambahkan pada fase sesuai roadmap yang disetujui."
      />
      <Link href={backHref} className="inline-block">
        <Button variant="secondary" size="sm">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Button>
      </Link>
    </div>
  );
}
