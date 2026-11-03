import { beforeEach, describe, expect, it, vi } from "vitest";

async function freshServices() {
  vi.resetModules();
  return await import("@/lib/services");
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");
});

describe("loans service (mock)", () => {
  it("menandai peminjaman aktif sebagai kembali", async () => {
    const svc = await freshServices();
    const borrowing = await svc.markBorrowingReturned("brw-001");
    expect(borrowing.status).toBe("returned");
    expect(borrowing.returnedAt).not.toBeNull();
  });

  it("menolak pengembalian ganda", async () => {
    const svc = await freshServices();
    await expect(svc.markBorrowingReturned("brw-002")).rejects.toThrow(
      "Buku ini sudah ditandai kembali."
    );
  });

  it("menolak id yang tidak dikenal", async () => {
    const svc = await freshServices();
    await expect(svc.markBorrowingReturned("brw-999")).rejects.toThrow(
      "Data peminjaman tidak ditemukan."
    );
  });
});

describe("registrations service (mock)", () => {
  it("mengembalikan seluruh pendaftaran terurut terbaru", async () => {
    const svc = await freshServices();
    const items = await svc.listAllRegistrations();
    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((r) => r.activityId)).size).toBeGreaterThan(1);
  });

  it("mengembalikan satu pendaftaran berdasar id dan null bila tidak ada", async () => {
    const svc = await freshServices();
    const found = await svc.getRegistration("reg-001");
    expect(found?.reference).toBe("REG-2026-0001");
    const missing = await svc.getRegistration("reg-999");
    expect(missing).toBeNull();
  });
});

describe("settings service (mock)", () => {
  it("memulai dengan semua nilai null (tanpa data fiktif)", async () => {
    const svc = await freshServices();
    const settings = await svc.getSiteSettings();
    expect(Object.values(settings).every((v) => v === null)).toBe(true);
  });

  it("memperbarui sebagian pengaturan dan mengubah kosong jadi null", async () => {
    const svc = await freshServices();
    const updated = await svc.updateSiteSettings({
      address: "Jl. Contoh 1",
      phone: "",
      instagramUrl: "https://www.instagram.com/retemali",
    });
    expect(updated.address).toBe("Jl. Contoh 1");
    expect(updated.phone).toBeNull();
    expect(updated.instagramUrl).toBe("https://www.instagram.com/retemali");
    expect(updated.qrisImageUrl).toBeNull();
  });
});

describe("payments service filter (mock)", () => {
  it("memfilter berdasar subjek dan status", async () => {
    const svc = await freshServices();
    const donationPayments = await svc.listPayments({ subject: "donation" });
    expect(
      donationPayments.every((p) => p.subject === "donation")
    ).toBe(true);
    const pendingRegistration = await svc.listPayments({
      subject: "activity_registration",
      status: "pending",
    });
    expect(pendingRegistration.length).toBeGreaterThan(0);
    expect(
      pendingRegistration.every((p) => p.subject === "activity_registration")
    ).toBe(true);
  });
});
