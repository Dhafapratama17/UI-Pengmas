import { SectionPlaceholder } from "@/app/section-placeholder";
import { adminSections } from "@/lib/section-placeholders";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const meta =
    adminSections[section] ??
    {
      title: `Manajemen: ${section}`,
      phase: "Fase 8",
      description:
        "Rute dinamis di bawah shell admin; isi dengan fitur pada fase berikutnya.",
    };

  return (
    <SectionPlaceholder
      title={meta.title}
      description={meta.description}
      phase={meta.phase}
      backHref="/admin"
      backLabel="Kembali ke Dashboard"
    />
  );
}
