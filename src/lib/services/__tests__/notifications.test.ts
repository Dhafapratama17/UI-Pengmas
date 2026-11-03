import { beforeEach, describe, expect, it, vi } from "vitest";

async function freshNotificationServices() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");
  return await import("@/lib/services/notifications");
}

describe("notifications service (mock)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");
  });

  it("membuat notifikasi untuk pengguna", async () => {
    const svc = await freshNotificationServices();
    const notif = svc.notifyUser("usr-001", {
      category: "pengumuman",
      title: "Test Notifikasi",
      body: "Ini adalah notifikasi uji coba.",
      href: "/member/notifikasi",
    });

    expect(notif).not.toBeNull();
    expect(notif?.userId).toBe("usr-001");
    expect(notif?.category).toBe("pengumuman");
    expect(notif?.title).toBe("Test Notifikasi");
    expect(notif?.readAt).toBeNull();
  });

  it("mengembalikan null untuk pengguna yang tidak ada", async () => {
    const svc = await freshNotificationServices();
    const notif = svc.notifyUser("tidak-ada", {
      category: "pengumuman",
      title: "Test",
      body: "Test body",
    });
    expect(notif).toBeNull();
  });

  it("mengambil notifikasi milik pengguna sendiri", async () => {
    const svc = await freshNotificationServices();
    svc.notifyUser("usr-001", {
      category: "absensi",
      title: "Kehadiran",
      body: "Anda hadir.",
    });
    svc.notifyUser("usr-v01", {
      category: "pengumuman",
      title: "Untuk Relawan",
      body: "Hanya relawan.",
    });

    const mine = await svc.listNotificationsForUser("usr-001");
    const his = await svc.listNotificationsForUser("usr-v01");

    expect(mine.every((n) => n.userId === "usr-001")).toBe(true);
    expect(his.every((n) => n.userId === "usr-v01")).toBe(true);
    expect(mine.length).toBeGreaterThanOrEqual(1);
    expect(his.length).toBeGreaterThanOrEqual(1);
  });

  it("menghitung notifikasi belum dibaca", async () => {
    const svc = await freshNotificationServices();
    svc.notifyUser("usr-001", {
      category: "pembayaran",
      title: "Belum Dibaca 1",
      body: "Body 1",
    });
    svc.notifyUser("usr-001", {
      category: "pembayaran",
      title: "Belum Dibaca 2",
      body: "Body 2",
    });

    const count = await svc.getUnreadCount("usr-001");
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("menandai satu notifikasi sebagai dibaca", async () => {
    const svc = await freshNotificationServices();
    const notif = svc.notifyUser("usr-001", {
      category: "donasi",
      title: "Donasi",
      body: "Terima kasih",
    });

    const before = await svc.getUnreadCount("usr-001");
    await svc.markNotificationRead(notif!.id, "usr-001");
    const after = await svc.getUnreadCount("usr-001");

    expect(after).toBeLessThan(before);
  });

  it("menandai semua notifikasi sebagai dibaca", async () => {
    const svc = await freshNotificationServices();
    const n1 = svc.notifyUser("usr-001", {
      category: "kegiatan",
      title: "Kegiatan 1",
      body: "Body 1",
    });
    const n2 = svc.notifyUser("usr-001", {
      category: "kegiatan",
      title: "Kegiatan 2",
      body: "Body 2",
    });

    await svc.markAllNotificationsRead("usr-001");
    const items = await svc.listNotificationsForUser("usr-001");
    const found1 = items.find((i) => i.id === n1!.id);
    const found2 = items.find((i) => i.id === n2!.id);
    expect(found1?.readAt).not.toBeNull();
    expect(found2?.readAt).not.toBeNull();
  });

  it("tidak bisa menandai notifikasi orang lain sebagai dibaca", async () => {
    const svc = await freshNotificationServices();
    svc.notifyUser("usr-v01", {
      category: "pengumuman",
      title: "Untuk Volunteer",
      body: "Body",
    });

    const all = await svc.listNotificationsForUser("usr-v01");
    const target = all.find((n) => n.userId === "usr-v01");
    expect(target).toBeDefined();

    await svc.markNotificationRead(target!.id, "usr-001");
    const volunteerUnread = await svc.getUnreadCount("usr-v01");
    expect(volunteerUnread).toBeGreaterThan(0);
  });

  it("broadcast hanya dapat dilakukan admin", async () => {
    const svc = await freshNotificationServices();

    await expect(
      svc.broadcastNotifications("all", {
        category: "pengumuman",
        title: "Broadcast",
        body: "Ini broadcast.",
      }, "usr-001"),
    ).rejects.toThrow(/admin/i);
  });

  it("broadcast mengirim ke target yang sesuai", async () => {
    const svc = await freshNotificationServices();

    const count = await svc.broadcastNotifications("all", {
      category: "pengumuman",
      title: "Broadcast Semua",
      body: "Untuk semua.",
    }, "usr-a01");

    expect(count).toBeGreaterThan(0);
    const memberNotifs = await svc.listNotificationsForUser("usr-001");
    const volunteerNotifs = await svc.listNotificationsForUser("usr-v01");
    expect(memberNotifs.some((n) => n.title === "Broadcast Semua")).toBe(true);
    expect(volunteerNotifs.some((n) => n.title === "Broadcast Semua")).toBe(true);
  });

  it("broadcast hanya ke member saat target member", async () => {
    const svc = await freshNotificationServices();

    await svc.broadcastNotifications("member", {
      category: "pengumuman",
      title: "Hanya Member",
      body: "Untuk member saja.",
    }, "usr-a01");

    const memberNotifs = await svc.listNotificationsForUser("usr-001");
    const volunteerNotifs = await svc.listNotificationsForUser("usr-v01");
    expect(memberNotifs.some((n) => n.title === "Hanya Member")).toBe(true);
    expect(
      volunteerNotifs.some((n) => n.title === "Hanya Member"),
    ).toBe(false);
  });
});
