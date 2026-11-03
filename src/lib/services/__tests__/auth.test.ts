import { describe, expect, it } from "vitest";
import {
  decodeSessionCookie,
  dashboardForRole,
  SESSION_COOKIE,
  encodeSessionCookie,
} from "@/lib/auth/session-cookie";
import { store } from "@/lib/mock-store";
import {
  authenticate,
  registerMember,
  requestPasswordRecovery,
  verifyMockLogin,
  changeAccountPassword,
} from "@/lib/services/auth";
import { updateMemberProfile } from "@/lib/services/members";
import type { Profile } from "@/types/db";
import type { AuthSession } from "@/types/auth";

const demoPassword = "retemali2026-demo";

describe("auth service (mock)", () => {
  it("admin berhasil login dengan kredensial yang benar", async () => {
    const result = await authenticate("admin", "admin@contoh-email.test", demoPassword);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.role).toBe("admin");
      expect(result.session.userId).toBe("usr-a01");
      expect(result.session.sessionKind).toBe("mock");
    }
  });

  it("member berhasil login dan mendapat role member", async () => {
    const result = await authenticate(
      "member",
      "SITI.MEMBER@contoh-email.test",
      demoPassword,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.fullName).toBe("Siti Rahmawati");
      expect(result.session.role).toBe("member");
    }
  });

  it("relawan terverifikasi berhasil login", async () => {
    const result = await authenticate(
      "volunteer",
      "rian.volunteer@contoh-email.test",
      demoPassword,
    );
    expect(result.ok).toBe(true);
  });

  it("password salah ditolak Tanpa membocorkan role", async () => {
    const result = await authenticate("member", "siti.member@contoh-email.test", "passwordsalah1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_credentials");
  });

  it("email yang tidak terdaftar ditolak", async () => {
    const result = await authenticate("member", "tidak.ada@contoh-email.test", demoPassword);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_credentials");
  });

  it("email admin dipakai pada mode member ditolak role_mismatch", async () => {
    const result = await authenticate("member", "admin@contoh-email.test", demoPassword);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("role_mismatch");
      expect(result.message).toContain("Administrator");
    }
  });

  it("relawan belum disetujui ditolak volunteer_not_approved", () => {
    const pendingProfile: Profile = {
      id: "usr-vtest",
      memberNo: "RM-2026-901",
      email: "pending.volunteer@contoh-email.test",
      fullName: "Relawan Pending",
      phone: "0810-0000-901",
      avatarUrl: null,
      role: "volunteer",
      membershipStatus: "active",
      volunteerApprovalStatus: "pending",
      createdAt: "2026-09-01",
    };
    store.profiles.push(pendingProfile);
    try {
      const result = verifyMockLogin(
        "volunteer",
        pendingProfile.email,
        demoPassword,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe("volunteer_not_approved");
    } finally {
      store.profiles = store.profiles.filter((p) => p.id !== pendingProfile.id);
    }
  });
});

describe("registasi member (mock)", () => {
  const testEmail = "dewi.baru@contoh-email.test";

  it("pendaftaran member baru berhasil dan menunggu verifikasi keanggotaan", async () => {
    const before = store.profiles.length;
    const result = await registerMember({
      fullName: "Dewi Anggraini",
      email: testEmail,
      phone: "0810-0000-701",
      password: "sandiaman2026",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.memberNo).toBe("RM-2026-100");
    }
    expect(store.profiles.length).toBe(before + 1);
    const created = store.profiles.find((p) => p.email === testEmail);
    expect(created?.role).toBe("member");
    expect(created?.membershipStatus).toBe("pending");
    expect(created?.volunteerApprovalStatus).toBe("pending");
  });

  it("member baru dapat masuk dengan kata sandi yang didaftarkan", async () => {
    const result = await authenticate("member", testEmail, "sandiaman2026");
    expect(result.ok).toBe(true);
  });

  it("member baru ditolak jika pakai kata sandi demo lainnya", async () => {
    const result = await authenticate("member", testEmail, demoPassword);
    expect(result.ok).toBe(false);
  });

  it("email yang sudah terdaftar ditolak dengan email_taken", async () => {
    const result = await registerMember({
      fullName: "Duplikat Anggota",
      email: testEmail,
      phone: "0810-0000-702",
      password: "sandiaman2027",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("email_taken");
  });

  it("pemulihan kata sandi untuk email terdaftar tersimulasikan terkirim", async () => {
    const result = await requestPasswordRecovery(testEmail);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.delivered).toBe("mock_simulation");
  });

  it("pemulihan kata sandi untuk email tidak terdaftar ditolak", async () => {
    const result = await requestPasswordRecovery("nihil@contoh-email.test");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("email_not_registered");
  });

  it("pemulihan kata sandi peka terhadap email duplikat besar-kecil", async () => {
    const result = await requestPasswordRecovery(
      "DEWI.BARU@CONTOH-EMAIL.TEST",
    );
    expect(result.ok).toBe(true);
  });
});

describe("profil dan kata sandi akun (mock)", () => {
  it("profil member diperbarui dan tidak mengubah email/memberNo", async () => {
    const updated = await updateMemberProfile("usr-001", {
      fullName: "Siti Rahmawati Kusuma",
      phone: "0810-0000-999",
    });
    expect(updated).not.toBeNull();
    expect(updated!.fullName).toBe("Siti Rahmawati Kusuma");
    expect(updated!.phone).toBe("0810-0000-999");
    expect(updated!.email).toBe("siti.member@contoh-email.test");
    expect(updated!.memberNo).toBe("RM-2026-001");
  });

  it("profil member yang tidak ada mengembalikan null", async () => {
    const updated = await updateMemberProfile("usr-tidak-ada", {
      fullName: "Siapa Saja",
      phone: "0810-0000-111",
    });
    expect(updated).toBeNull();
  });

  it("kata sandi diperbarui ketika sandi lama cocok", async () => {
    const userId = "usr-002";
    const email = "budi.member@contoh-email.test";
    const updatedToken = `sandibaru${Date.now()}`;
    const result = await changeAccountPassword(
      userId,
      email,
      demoPassword,
      updatedToken,
    );
    expect(result.ok).toBe(true);
    const login = await authenticate("member", email, updatedToken);
    expect(login.ok).toBe(true);
    const rejected = await authenticate("member", email, demoPassword);
    expect(rejected.ok).toBe(false);
    await changeAccountPassword(userId, email, updatedToken, demoPassword);
  });

  it("kata sandi salah saat ini ditolak tanpa mengganti apa pun", async () => {
    const result = await changeAccountPassword(
      "usr-003",
      "ayu.member@contoh-email.test",
      "bukan-sandi-demo",
      "sandibaru9999",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("wrong_password");
  });
});

describe("session cookie helpers", () => {
  const session: AuthSession = {
    userId: "usr-001",
    email: "siti.member@contoh-email.test",
    fullName: "Siti Rahmawati",
    role: "member",
    issuedAt: "2026-10-30T10:00:00.000Z",
    expiresAt: "2026-11-06T10:00:00.000Z",
    sessionKind: "mock",
  };

  it("roundtrip encode/decode menghasilkan sesi yang sama", async () => {
    const encoded = await encodeSessionCookie(session);
    expect(await decodeSessionCookie(encoded)).toEqual(session);
  });

  it("sesi kedaluwarsa ditolak sebagai null", async () => {
    const expiredSession: AuthSession = {
      ...session,
      expiresAt: "2020-01-01T00:00:00.000Z",
    };
    const encoded = await encodeSessionCookie(expiredSession);
    expect(await decodeSessionCookie(encoded)).toBeNull();
  });

  it("nilai korup atau dengan bentuk salah ditolak sebagai null", async () => {
    expect(await decodeSessionCookie(undefined)).toBeNull();
    expect(await decodeSessionCookie("bukan-json%21%40%23")).toBeNull();
    expect(
      await decodeSessionCookie(
        encodeURIComponent(JSON.stringify({ userId: 1, role: "hacker" })),
      ),
    ).toBeNull();
    expect(SESSION_COOKIE).toBe("retemali_session");
  });

  it("dashboardForRole memetakan tiap role ke rute benar", () => {
    expect(dashboardForRole("admin")).toBe("/admin");
    expect(dashboardForRole("volunteer")).toBe("/volunteer");
    expect(dashboardForRole("member")).toBe("/member");
    expect(dashboardForRole("nonmember")).toBe("/beranda");
  });
});
