export const activityFilterOptions = [
  { slug: "semua", label: "Semua" },
  { slug: "gratis", label: "Gratis" },
  { slug: "berbayar", label: "Berbayar" },
  { slug: "selesai", label: "Selesai" },
] as const;

export type ActivityFilterSlug = (typeof activityFilterOptions)[number]["slug"];

export function parseActivityFilter(
  value: string | string[] | undefined
): ActivityFilterSlug {
  const pick = Array.isArray(value) ? value[0] : value;
  return (
    activityFilterOptions.find((option) => option.slug === pick)?.slug ?? "semua"
  );
}
