import { SectionPlaceholder } from "@/app/section-placeholder";
import { volunteerSections } from "@/lib/section-placeholders";

export default async function VolunteerSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const meta =
    volunteerSections[section] ??
    {
      title: `Menu Relawan: ${section}`,
      phase: "Fase 7",
      description:
        "Rute dinamis di bawah shell volunteer; isi fungsional di fase berikutnya.",
    };

  return (
    <SectionPlaceholder
      title={meta.title}
      description={meta.description}
      phase={meta.phase}
      backHref="/volunteer"
      backLabel="Kembali ke Dashboard Relawan"
    />
  );
}
