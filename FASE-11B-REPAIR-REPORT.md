# Laporan Fase 11B-REPAIR — Perbaikan Visual 94 Frame FigCraft ReteMali

Tanggal: 3 November 2026
Status: **SELESAI — menunggu persetujuan sebelum Fase 11C.**

## 1. File sumber & hasil

| Peran | File | Status |
|---|---|---|
| Sumber fase ini (jangan diubah) | `retemali_library_system_final.figcraft` (214.138 byte, 10:48:25) | UTUH — identik dengan backup-nya |
| Backup sumber fase ini | `retemali_library_system_final.figcraft.backup-20261103-repair` | tersedia |
| Sumber Fase 11B-FINAL (utuh) | `retemali_library_system.figcraft` (191.302 byte, 10:32:03) | UTUH |
| Backup lama | `...backup-20261103-final`, `...backup-20261102` | tidak disentuh |
| **Hasil kerja fase ini** | `retemali_library_system_repaired.figcraft` (214.907 byte, 15:02:59) | 4 halaman, 3.591 node, 0 gambar raster |

Dokumen `retemali_library_system_final.figcraft` TIDAK pernah ditulis ulang — semua perintah dijalankan `--in final --out repaired` pada salinan kerja.

## 2. Metode

Headless via FigCraft CLI (`figcraft-cli run <script.json> --in <file> --out <file>`; MCP port 7979 mati). Pipeline:

1. **Baseline**: fetch rekursif semua node → `tmp_analysis/tree.json` (7.174 node).
2. **Deteksi otomatis**: `tmp_analysis/detect.py` — 2 kelas: `overflow` (teks/komponen keluar container >3px) dan `sibling-overlap` (bounding box saudara beririsan).
3. **Ukur glyph**: probe `textAutoResize:"widthAndHeight"` → `measures.json` (114 teks) untuk membedakan teks yang cukup dipersempit vs yang harus wrap.
4. **Fix engine**: `tmp_analysis/fix_engine.py` → `fix_plan.json` (130 perintah, 0 warning) — handler per pola (fit pill, shrink box, geser badge/judul, dsb.) + collision check.
5. **Re-detect** setiap round sampai 0 issue, lalu review visual PNG.

## 3. Deteksi awal

- **108 issue di 56 dari 94 frame**: 60 `overflow` + 48 `sibling-overlap`, 38 pola unik (`issues_report.txt`).
- Yang paling parah: badge × judul bertumpuk (Screen 07/08 dsb.), ISBN terpotong "…978-979-3062", KPI Admin "7 Antrean" menimpa label, tombol menimpa teks, pill melebar keluar kartu.

## 4. Jumlah perbaikan per breakpoint (total 184 perintah CLI, 0 gagal)

| Tahap | Mobile | Tablet | Desktop | Design System | Jumlah perintah |
|---|---|---|---|---|---|
| Round 1 (fix_plan) | 44 | 42 | 42 | 2 | 130 |
| Newline literal `\n` → baris asli (12 teks unik × 3 bp) | 12 | 12 | 12 | 0 | 36 |
| Round B — `Phys Points` tumbuh vs `Phys Form CTA` (Screen 11) | 4 | 4 | 4 | 0 | 12 |
| Round B — gap tombol "Unggah Ulang Bukti" (Screen 10) | 2 | 2 | 2 | 0 | 6 |
| **Total node-ops per breakpoint** | **62** | **60** | **60** | **2** | **184** |

Jenis perintah round 1: `node.set` 115 + `transform.resize` 15. Tahap newline: 36 teks (Policy Body, Phys/Pol/SOP Points, Cat/Fin/Mem/ES Points, Selected Evt Text, A1/A2 Reason, Succ Detail) — makna informasi TIDAK berubah, hanya `\n` literal yang tampil jadi sampah diganti baris baru sungguhan.

## 5. Validasi struktur (`figcraft-cli info --json`)

- 4 halaman: Page 1 = 1 frame Design System (450×844), Page 2 = 31 Mobile (390×844), Page 3 = 31 Tablet (768×1024), Page 4 = 31 Desktop (1440×900) → **94 frame, ukuran frame tidak ada yang berubah**.
- `nodes: 3591`, `images: 0`, `missingFonts: []`, `styles/variables: 0`.
- Tipe node hanya FRAME (1.467) + TEXT (2.120) → **tidak ada frame raster/bitmap**.
- Sumber `retemali_library_system_final.figcraft` dan `retemali_library_system.figcraft` tidak berubah (waktu tulis & ukuran file sama dengan backup-nya).

## 6. Validasi deteksi

- Sebelum perbaikan: **108 issue / 56 frame**.
- Sesudah perbaikan (re-fetch + re-detect penuh): **0 issue / 94 frame** ✓.

## 7. Export preview

94 PNG hasil verifikasi di **`design-exports-repaired/`** (4 perintah `export --page "Page 1..4"`, diulang setelah tiap round). Perbandingan sebelum/sesudah tersedia di `design-exports-final/` (sebelum reparasi) dan `C:\Users\nindy\AppData\Local\Temp\opencode\orig-export\` (ekspor dokumen asli, dibuat saat fase ini untuk cek regresi).

## 8. Review visual (manual, per frame)

Sudah diperiksa dari `design-exports-repaired/`: **25 frame** — Design System; Mobile 01, 02, 04, 05, 07, 08, 10, 11, 12, 15, 16, 18, 21, 23, 24, 25, 26, 27, 28, 30; Tablet 04, 07; Desktop 04, 07. Cek regresi dibanding `design-exports-final` (Screen 01, 21, Tablet/Desktop 07) dan dokumen asli (Tablet/Desktop 04): **tidak ada regresi**; malah membaik, contoh:

- Mobile 07: ISBN "978-979-3062" kini satu baris penuh (sebelumnya terpotong).
- Mobile 08: badge "Gratis" tidak lagi menimpa judul; "Berbayar: Rp35.000" tampil penuh.
- Admin 21: nilai KPI "7 Antrean" tidak lagi bertumpuk di atas labelnya.
- Semua kartu "Ketentuan/Points" kini memakai bullet baris sungguhan (bukan `\n` literal).

## 9. Daftar masalah tersisa (jujur)

1. **Kolom kiri ~390px pada frame Tablet & Desktop** — konten hanya memakai lebar mobile, sisanya kosong. Diverifikasi: **sudah ada di dokumen asli** (`retemali_library_system.figcraft`), bukan akibat fase ini. Memperbaikinya = layout ulang total = "gambar ulang" → di luar mandat fase ini, butuh persetujuan (kandidat Fase 11C+).
2. **Panah "→" turun baris 2** pada beberapa CTA panjang (mis. "Buka →", "Manajemen Koleksi Buku & … →") — dibuktikan sudah ada sebelum reparasi (identik di `design-exports-final`), bukan regresi. Cosmetic saja, tidak overflow.
3. **Detektor otomatis hanya menangkap overlap/overflow box >3px.** Kualitas spacing/halus (jarak tidak simetris, dsb.) dinilai lewat review visual 25 frame di atas; **69 frame lainnya belum diperiksa pixel-per-pixel** (semuanya lolos detektor geometri dan identik strukturnya dengan frame yang sudah direview per pola).
4. FigCraft Desktop tidak berjalan (MCP 7979 mati) sehingga verifikasi akhir dilakukan via PNG export, bukan interaksi langsung.

## 10. Cara membuka hasil

1. Buka **FigCraft Desktop** (control bridge port 7979 otomatis aktif).
2. File → Open → `retemali_library_system_repaired.figcraft`.
3. Periksa Page 2 (Mobile), Page 3 (Tablet), Page 4 (Desktop); frame rujukan user: **Mobile Screen 07 & 08**.
4. Bandingkan dengan preview PNG di `design-exports-repaired/` bila perlu.
5. Dokumen final phase sebelumnya tetap ada di `retemali_library_system_final.figcraft` — tidak dihapus/diubah.

## 11. Skrip & artefak pendukung

`tmp_analysis/`: `analyze.py` (fetch), `detect.py` (deteksi), `measures.json` (ukur glyph), `fix_engine.py` + `fix_plan.json` (130 perintah), `apply_fixes.py`, `apply_newlines.py`, `fix_phys.py`, `fix_s10_apply.py`, `issues_report.txt`, `tree.json`.

## 12. Penutup

Fase 11B-REPAIR dinyatakan **selesai**: 184 perintah perbaikan, deteksi 0/94, 94 PNG ter-export, sumber utuh. **Berhenti di sini — tidak memulai Fase 11C (atau perbaikan layout tablet/desktop) tanpa persetujuan.**
