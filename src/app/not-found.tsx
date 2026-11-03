import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-2xl font-bold text-primary-deep">
        Halaman tidak ditemukan
      </h1>
      <p className="max-w-sm text-sm text-ink-soft">
        Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="rounded-field bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
