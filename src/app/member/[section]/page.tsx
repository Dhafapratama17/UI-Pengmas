import { SectionPlaceholder } from "@/app/section-placeholder";
import { memberSections } from "@/lib/section-placeholders";

export default async function MemberSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const meta =
    memberSections[section] ??
    {
      title: `Menu Member: ${section}`,
      phase: "Fase 7",
      description:
        "Rute dinamis di bawah shell member; isi fungsional di fase berikutnya.",
    };

  return (
    <SectionPlaceholder
      title={meta.title}
      description={meta.description}
      phase={meta.phase}
      backHref="/member"
      backLabel="Kembali ke Dashboard Member"
    />
  );
}
