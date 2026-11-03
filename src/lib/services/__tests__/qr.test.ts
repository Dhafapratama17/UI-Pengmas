import { beforeEach, describe, expect, it, vi } from "vitest";

async function freshQrServices() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");
  return await import("@/lib/services/qr");
}

describe("qr service (mock)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");
    vi.setSystemTime(new Date("2026-11-02T08:00:00+07:00"));
  });

  it("membuat token QR untuk kegiatan terpublikasi", async () => {
    const svc = await freshQrServices();
    const token = await svc.createOrRefreshToken("act-001", "usr-a01");
    expect(token.token).toMatch(/^rt-/);
    expect(token.active).toBe(true);
    expect(token.activityId).toBe("act-001");
    expect(token.createdBy).toBe("usr-a01");
    expect(token.expiresAt).toBeTruthy();
  });

  it("menolak pembuatan token untuk kegiatan draft", async () => {
    const svc = await freshQrServices();
    await expect(
      svc.createOrRefreshToken("act-005", "usr-a01"),
    ).rejects.toThrow(/terpublikasi/i);
  });

  it("menolak pembuatan token untuk non-admin", async () => {
    const svc = await freshQrServices();
    await expect(
      svc.createOrRefreshToken("act-001", "usr-001"),
    ).rejects.toThrow(/admin/i);
  });

  it("mengembalikan null untuk token yang tidak ada", async () => {
    const svc = await freshQrServices();
    const result = svc.resolveActiveToken("rt-tidak-ada");
    expect(result).toBeNull();
  });

  it("menonaktifkan token lama saat membuat token baru", async () => {
    const svc = await freshQrServices();
    await svc.createOrRefreshToken("act-001", "usr-a01");
    const firstActive = svc.getActiveTokenForActivity("act-001");
    expect(firstActive?.active).toBe(true);

    await svc.createOrRefreshToken("act-001", "usr-a01");
    const secondActive = svc.getActiveTokenForActivity("act-001");
    expect(secondActive?.active).toBe(true);
    expect(secondActive?.token).not.toBe(firstActive?.token);

    const oldResolved = svc.resolveActiveToken(firstActive?.token ?? "");
    expect(oldResolved).toBeNull();
  });

  it("mematikan dan mengaktifkan token", async () => {
    const svc = await freshQrServices();
    await svc.createOrRefreshToken("act-001", "usr-a01");

    const deactivated = await svc.setTokenActive(
      "act-001",
      false,
      "usr-a01",
    );
    expect(deactivated?.active).toBe(false);

    const reactivated = await svc.setTokenActive(
      "act-001",
      true,
      "usr-a01",
    );
    expect(reactivated?.active).toBe(true);
  });

  it("check-in berhasil untuk member terdaftar dalam jendela", async () => {
    const svc = await freshQrServices();
    vi.setSystemTime(new Date("2026-11-07T09:30:00+07:00"));

    const token = await svc.createOrRefreshToken("act-001", "usr-a01");
    const result = await svc.checkInByToken(token.token, {
      id: "usr-001",
      role: "member",
    });

    if (result.status === "success") {
      expect(result.record.activityId).toBe("act-001");
      expect(result.record.personId).toBe("usr-001");
      expect(result.record.personRole).toBe("member");
      expect(result.record.scannedAt).toBeTruthy();
    } else {
      throw new Error("Expected success check-in");
    }
  });

  it("menolak check-in ganda", async () => {
    const svc = await freshQrServices();
    vi.setSystemTime(new Date("2026-11-07T09:30:00+07:00"));

    const token = await svc.createOrRefreshToken("act-001", "usr-a01");
    await svc.checkInByToken(token.token, {
      id: "usr-001",
      role: "member",
    });

    const result = await svc.checkInByToken(token.token, {
      id: "usr-001",
      role: "member",
    });
    expect(result.status).toBe("already_checked_in");
  });

  it("menolak check-in untuk member yang belum terdaftar", async () => {
    const svc = await freshQrServices();
    vi.setSystemTime(new Date("2026-11-07T09:30:00+07:00"));

    const token = await svc.createOrRefreshToken("act-001", "usr-a01");
    const result = await svc.checkInByToken(token.token, {
      id: "usr-003",
      role: "member",
    });
    expect(result.status).toBe("not_registered");
  });

  it("menolak check-in untuk volunteer yang tidak bertugas", async () => {
    const svc = await freshQrServices();
    vi.setSystemTime(new Date("2026-11-07T09:30:00+07:00"));

    const token = await svc.createOrRefreshToken("act-001", "usr-a01");
    const result = await svc.checkInByToken(token.token, {
      id: "usr-001",
      role: "volunteer",
    });
    expect(result.status).toBe("not_registered");
  });

  it("mengizinkan check-in volunteer yang bertugas pada kegiatan", async () => {
    const svc = await freshQrServices();
    vi.setSystemTime(new Date("2026-11-07T09:30:00+07:00"));

    const token = await svc.createOrRefreshToken("act-001", "usr-a01");
    const result = await svc.checkInByToken(token.token, {
      id: "usr-v01",
      role: "volunteer",
    });
    if (result.status === "success") {
      expect(result.record.personRole).toBe("volunteer");
    } else {
      throw new Error("Expected success check-in");
    }
  });

  it("menolak check-in di luar jendela absensi", async () => {
    const svc = await freshQrServices();
    vi.setSystemTime(new Date("2026-11-02T08:00:00+07:00"));

    const token = await svc.createOrRefreshToken("act-001", "usr-a01");
    const result = await svc.checkInByToken(token.token, {
      id: "usr-001",
      role: "member",
    });
    expect(result.status).toBe("window_closed");
  });

  it("mengambil daftar kehadiran kegiatan", async () => {
    const svc = await freshQrServices();
    const overview = await svc.listActivityAttendance("act-001");
    expect(overview.eligibleCount).toBeGreaterThan(0);
    expect(Array.isArray(overview.rows)).toBe(true);
  });

  it("mengisolasi kehadiran per kegiatan", async () => {
    const svc = await freshQrServices();
    const overview001 = await svc.listActivityAttendance("act-001");
    const overview002 = await svc.listActivityAttendance("act-002");
    expect(overview001.rows.length).not.toBe(overview002.rows.length);
  });
});
