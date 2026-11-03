import { beforeEach, describe, expect, it, vi } from "vitest";

async function freshServices() {
  vi.resetModules();
  return await import("@/lib/services");
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");
});

describe("books service (mock)", () => {
  it("mengembalikan daftar buku terpublikasi dengan paginasi", async () => {
    const svc = await freshServices();
    const result = await svc.listBooks({ pageSize: 5 });
    expect(result.items).toHaveLength(5);
    expect(result.total).toBe(12);
    expect(result.page).toBe(1);
  });

  it("memfilter pencarian judul/penulis", async () => {
    const svc = await freshServices();
    const result = await svc.listBooks({ search: "tere liye" });
    expect(result.items.map((b) => b.title)).toEqual(["Bumi"]);
  });

  it("pencarian kata kunci juga mencocokkan nama kategori", async () => {
    const svc = await freshServices();
    const result = await svc.listBooks({ search: "sains", pageSize: 50 });
    expect(result.items).toHaveLength(3);
    expect(result.items.map((b) => b.title).sort()).toEqual([
      "Cosmos: Ada di Mata Bintang",
      "Ensiklopedia Sains untuk Anak",
      "Sejarah untuk Semua: Indonesia",
    ]);
  });

  it("memfilter hanya tersedia", async () => {
    const svc = await freshServices();
    const result = await svc.listBooks({ availableOnly: true, pageSize: 50 });
    expect(result.items.filter((b) => b.availableCopies === 0)).toHaveLength(0);
  });

  it("sortir judul menaik dan terpopuler", async () => {
    const svc = await freshServices();
    const asc = await svc.listBooks({ sort: "title_asc", pageSize: 50 });
    expect(asc.items[0].title).toBe("Aroma Karsa");

    const pop = await svc.listBooks({ sort: "popular", pageSize: 50 });
    expect(pop.items[0].popularity).toBeGreaterThanOrEqual(
      pop.items[1].popularity
    );
  });
});

describe("activities service (mock)", () => {
  it("hanya mengembalikan kegiatan terpublikasi", async () => {
    const svc = await freshServices();
    const items = await svc.listActivities({ now: new Date("2026-10-30") });
    expect(items.every((a) => a.status === "published")).toBe(true);
  });

  it("memisahkan kegiatan gratis dan berbayar", async () => {
    const svc = await freshServices();
    const free = await svc.listActivities({
      freeOnly: true,
      now: new Date("2026-10-30"),
    });
    const paid = await svc.listActivities({
      paidOnly: true,
      now: new Date("2026-10-30"),
    });
    expect(free.every((a) => a.feeAmount === 0)).toBe(true);
    expect(paid.every((a) => a.feeAmount > 0)).toBe(true);
  });

  it("menandai jendela pendaftaran: open, deadline_passed", async () => {
    const svc = await freshServices();
    const open = await svc.listActivities({
      upcomingOnly: true,
      now: new Date("2026-10-30"),
    });
    const summary = await svc.describeRegistrationSummary(
      open[0],
      new Date("2026-10-30")
    );
    expect(summary.window).toBe("open");
  });
});

describe("registrations service (mock)", () => {
  it("mencegah registrasi ganda untuk email yang sama", async () => {
    const svc = await freshServices();
    await svc.createRegistration("act-001", {
      guestName: "Tamun Pertama",
      guestEmail: "tamu@contoh.test",
      guestPhone: "081234565789",
    });
    await expect(
      svc.createRegistration("act-001", {
        guestName: "Tamun Kedua",
        guestEmail: "tamu@contoh.test",
        guestPhone: "081234565789",
      })
    ).rejects.toThrow(/sudah terdaftar/i);
  });

  it("menerima email berbeda pada kegiatan yang sama", async () => {
    const svc = await freshServices();
    const first = await svc.createRegistration("act-001", {
      guestName: "Amanu Satu",
      guestEmail: "a@contoh.test",
      guestPhone: "081234565789",
    });
    const second = await svc.createRegistration("act-001", {
      guestName: "Amanu Dua",
      guestEmail: "b@contoh.test",
      guestPhone: "081234565789",
    });
    expect(first.reference).not.toBe(second.reference);
  });

  it("mencatat pembayaran berstatus pending, bukan verified", async () => {
    const svc = await freshServices();
    const { registration } = await svc.createPaidRegistration("act-002", {
      guestName: "Doni Berbayar",
      guestEmail: "doni@contoh.test",
      guestPhone: "081234565789",
    }, {
      method: "qris",
      evidenceFileName: "bukti-transfer-doni.jpg",
    })

    const payments = await svc.listPayments({ status: "pending" });
    const created = payments.find(
      (p) => p.activityRegistrationId === registration.id
    );
    expect(created?.status).toBe("pending");
    expect(created?.verifiedAt).toBeNull();
    expect(created?.evidenceUrl).toContain(
      `mock/evidence/${registration.reference}/`
    );
  });

  it("menolak pendaftaran setelah deadline", async () => {
    const svc = await freshServices();
    await expect(
      svc.createRegistration("act-006", {
        guestName: "Tamun Terlambat",
        guestEmail: "telat@contoh.test",
        guestPhone: "081234565789",
      })
    ).rejects.toThrow(/ditutup/i);
  });

  it("mengambil registrasi berdasarkan nomor referensi tanpa membedakan huruf besar-kecil", async () => {
    const svc = await freshServices();
    const created = await svc.createRegistration("act-001", {
      guestName: "Cari Referensi",
      guestEmail: "cari-ref@contoh.test",
      guestPhone: "081234565789",
    });
    const found = await svc.getRegistrationByReference(
      created.reference.toLowerCase()
    );
    expect(found?.id).toBe(created.id);
    const none = await svc.getRegistrationByReference("REG-9999-9999");
    expect(none).toBeNull();
  });

  it("verifikasi pembayaran menolak dengan alasan dan tidak menyatakan verified", async () => {
    const svc = await freshServices();
    const { registration } = await svc.createPaidRegistration("act-002", {
      guestName: "Verifikasi Sasaran",
      guestEmail: "verifikasi@contoh.test",
      guestPhone: "081234565789",
    }, {
      method: "bank_transfer",
      evidenceFileName: "bukti-verifikasi.png",
    });
    const pending = (await svc.listPayments({ status: "pending" })).find(
      (p) => p.activityRegistrationId === registration.id
    );
    expect(pending).toBeDefined();
    const rejected = await svc.verifyPayment(pending!.id, "rejected", {
      rejectionReason: "Nominal tidak sesuai",
    });
    expect(rejected.status).toBe("rejected");
    expect(rejected.verifiedAt).toBeNull();
    expect(rejected.rejectionReason).toBe("Nominal tidak sesuai");
    const stillUnpaid = (await svc.listPayments({ status: "verified" })).find(
      (p) => p.activityRegistrationId === registration.id
    );
    expect(stillUnpaid).toBeUndefined();
  });
});

describe("loans service (mock)", () => {
  it("menghitung status terlambat bila melewati dueDate", async () => {
    const svc = await freshServices();
    const loans = await svc.listBorrowingsByMember("usr-001");
    const overdue = loans.find((b) => b.id === "brw-003");
    const state = svc.describeLoanState(overdue!, new Date("2026-10-30"));
    expect(state.label).toBe("terlambat");
    expect(state.daysRemaining).toBeLessThan(0);
  });

  it("menghitung status sudah dikembalikan", async () => {
    const svc = await freshServices();
    const loans = await svc.listBorrowingsByMember("usr-001");
    const returned = loans.find((b) => b.id === "brw-002");
    const state = svc.describeLoanState(returned!, new Date("2026-10-30"));
    expect(state.label).toBe("sudah dikembalikan");
  });
});

describe("donations service (mock)", () => {
  it("donasi finansial bernilai pending dengan bukti & payment terkait", async () => {
    const svc = await freshServices();
    const donation = await svc.createFinancialDonation(
      {
        donorName: "Hamba Allah",
        donorEmail: "donatur@contoh-email.test",
        donorPhone: "081234565789",
        amount: 250000,
        notes: null,
      },
      { method: "bank_transfer", evidenceFileName: "bukti transfer.jpg" }
    );
    expect(donation.status).toBe("pending");
    expect(donation.amount).toBe(250000);
    expect(donation.reference).toMatch(new RegExp(`^DON-${new Date().getFullYear()}-`));
    expect(donation.evidenceUrl).toContain(
      `mock/evidence/${donation.reference}/bukti-transfer.jpg`
    );
    const payment = await svc.getDonationPayment(donation.id);
    expect(payment).not.toBeNull();
    expect(payment!.status).toBe("pending");
    expect(payment!.subject).toBe("donation");
    expect(payment!.method).toBe("bank_transfer");
  });

  it("donasi buku fisik menerima jadwal drop-off", async () => {
    const svc = await freshServices();
    const donation = await svc.createPhysicalDonation({
      donorName: "Nadia Fadilah",
      donorEmail: "nadia@contoh-email.test",
      donorPhone: "081234565789",
      bookCount: 7,
      bookTitles: "Ensiklopedia Sains untuk Anak, Gerbang Dunia Dongeng",
      bookCondition: "Baik",
      dropOffAt: "2026-11-03T10:00:00+07:00",
    });
    expect(donation.type).toBe("physical");
    expect(donation.bookCount).toBe(7);
    expect(donation.dropOffAt).toContain("T10:00:00");
  });

  it("donasi belum diverifikasi tidak boleh dikonfirmasi meski terbaca", async () => {
    const svc = await freshServices();
    const donation = await svc.createFinancialDonation(
      {
        donorName: "Hamba Allah",
        donorEmail: "donatur2@contoh-email.test",
        donorPhone: "081234565789",
        amount: 100000,
        notes: null,
      },
      { method: "qris", evidenceFileName: "bukti.png" }
    );
    expect(donation.status).not.toBe("confirmed");
    expect(donation.status).not.toBe("fulfilled");
    const paymentStatus = await svc.getDonationPaymentStatus(donation.id);
    expect(paymentStatus).toBe("pending");
  });

  it("pencarian referensi donasi tidak peduli huruf besar-kecil", async () => {
    const svc = await freshServices();
    const donation = await svc.createPhysicalDonation({
      donorName: "Rudi",
      donorEmail: "rudi@contoh-email.test",
      donorPhone: "081200001111",
      bookCount: 3,
      bookTitles: "Novel A",
      bookCondition: "Baik",
      dropOffAt: "2026-11-04T09:00:00+07:00",
    });
    const found = donation ? donation : null;
    if (!found) throw new Error("donasi gagal dibuat");
    const reference = found.reference;
    expect((await svc.getDonationByReference(reference.toLowerCase()))!.id).toBe(
      found.id
    );
  });
});
