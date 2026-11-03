"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Search } from "lucide-react";
import type { BookCategory } from "@/types/db";

const SORT_OPTIONS = [
  { value: "title_asc", label: "Judul A–Z" },
  { value: "title_desc", label: "Judul Z–A" },
  { value: "newest", label: "Terbaru ditambahkan" },
  { value: "popular", label: "Terpopuler" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function isSortValue(value: string): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

const fieldClasses =
  "w-full rounded-field border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const chipBase =
  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors";
const chipIdle = "border-surface-soft bg-white text-ink-soft hover:border-primary/50";
const chipActive = "border-primary bg-primary text-white";

export function CatalogControls({
  categories,
  resultLabel,
}: {
  categories: BookCategory[];
  resultLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const search = params.get("cari") ?? "";
  const category = params.get("kategori") ?? "";
  const availableOnly = params.get("tersedia") === "1";
  const rawSort = params.get("urut");
  const activeSort: SortValue =
    rawSort && isSortValue(rawSort) ? rawSort : "title_asc";

  const [term, setTerm] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const pushParams = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    const query = next.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const onTermChange = (value: string) => {
    setTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams((next) => {
        if (value.trim()) next.set("cari", value.trim());
        else next.delete("cari");
        next.delete("hal");
      });
    }, 350);
  };

  const selectCategory = (slug: string) => {
    pushParams((next) => {
      if (slug) next.set("kategori", slug);
      else next.delete("kategori");
      next.delete("hal");
    });
  };

  const toggleAvailability = () => {
    pushParams((next) => {
      if (availableOnly) next.delete("tersedia");
      else next.set("tersedia", "1");
      next.delete("hal");
    });
  };

  const changeSort = (value: string) => {
    pushParams((next) => {
      next.set("urut", value);
      next.delete("hal");
    });
  };

  return (
    <section aria-label="Pencarian dan filter katalog" className="space-y-4">
      <div className="rounded-card border border-surface-soft bg-white p-4 shadow-card">
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            aria-hidden
          >
            <Search className="h-4 w-4" />
          </span>
          <input
            id="katalog-cari"
            type="search"
            aria-label="Cari judul buku, penulis, atau kategori"
            placeholder="Cari judul buku, penulis, atau kategori…"
            className={`${fieldClasses} pl-10`}
            value={term}
            onChange={(e) => onTermChange(e.target.value)}
          />
        </div>
        <div
          className="mt-3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter kategori"
        >
          <button
            type="button"
            aria-pressed={category === ""}
            onClick={() => selectCategory("")}
            className={`${chipBase} ${category === "" ? chipActive : chipIdle}`}
          >
            Semua
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.slug}
              onClick={() => selectCategory(item.slug)}
              className={`${chipBase} ${
                category === item.slug ? chipActive : chipIdle
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            aria-pressed={availableOnly}
            onClick={toggleAvailability}
            className={`${chipBase} ${
              availableOnly
                ? "border-success bg-green-50 text-success"
                : chipIdle
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Tersedia saja
            </span>
          </button>
          <label
            htmlFor="katalog-urut"
            className="flex items-center gap-2 text-xs font-semibold text-ink-soft"
          >
            Urutkan
            <select
              id="katalog-urut"
              value={activeSort}
              onChange={(e) => changeSort(e.target.value)}
              className="rounded-field border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p
          className="mt-3 border-t border-surface-soft pt-3 text-xs text-ink-soft"
          role="status"
          aria-live="polite"
        >
          {pending ? "Memperbarui hasil…" : resultLabel}
        </p>
      </div>
    </section>
  );
}
