import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { SectionMeta } from "@/lib/section-placeholders";

export function RoutePlaceholder({
  meta,
  backHref,
}: {
  meta: SectionMeta;
  backHref: string;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle
        title={meta.title}
        description={meta.description}
        action={<Badge tone="info">Menunggu {meta.phase}</Badge>}
      />
      <EmptyState
        title="Rute sudah terpasang — fiturnya menyusul"
        description="Rute ini sudah tervalidasi dalam shell aplikasi sesuai design (4).md §17. Fungsionalitas penuh diisi sesuai fase yang disetujui di roadmap."
      />
      <Link href={backHref} className="inline-block">
        <Button variant="secondary" size="sm">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke dashboard
        </Button>
      </Link>
    </div>
  );
}
