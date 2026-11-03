import { dataMode } from "@/lib/config";
import { mockAccountPassword } from "@/lib/mock-data";
import { store } from "@/lib/mock-store";
import type {
  AuthResult,
  LoginAccessMode,
  RecoveryResult,
  RegisterResult,
} from "@/types/auth";
import type { Profile } from "@/types/db";

const memberNoPrefix = "RM-2026-";

export function resolveMockLoginPassword(email: string): string {
  const needle = email.trim().toLowerCase();
  const account = store.accounts.find((a) => a.email === needle);
  return account ? account.password : mockAccountPassword;
}

export function mapRoleLabel(role: string): string {
  if (role === "admin") return "Administrator";
  if (role === "volunteer") return "Relawan";
  return "Member";
}

export function verifyMockLogin(
  mode: LoginAccessMode,
  email: string,
  password: string,
): AuthResult {
  const needle = email.trim().toLowerCase();
  const profile = store.profiles.find(
    (p: Profile) => p.email.toLowerCase() === needle,
  );
  if (!profile || password !== resolveMockLoginPassword(email)) {
    return {
      ok: false,
      code: "invalid_credentials",
      message: "Email atau password salah.",
    };
  }
  if (profile.role !== mode) {
    return {
      ok: false,
      code: "role_mismatch",
      message: `Akun ini terdaftar sebagai ${mapRoleLabel(profile.role)}. Pilih mode akses yang sesuai.`,
    };
  }
  if (
    mode === "volunteer" &&
    profile.volunteerApprovalStatus !== "approved"
  ) {
    return {
      ok: false,
      code: "volunteer_not_approved",
      message: "Pendaftaran relawan Anda belum disetujui admin.",
    };
  }
  return {
    ok: true,
    session: {
      userId: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      sessionKind: "mock",
    },
  };
}

export async function authenticate(
  mode: LoginAccessMode,
  email: string,
  password: string,
): Promise<AuthResult> {
  if (dataMode === "supabase") {
    return {
      ok: false,
      code: "adapter_unavailable",
      message: "Adapter Supabase Auth belum tersedia. Gunakan mode mock.",
    };
  }
  return verifyMockLogin(mode, email.trim(), password);
}

function nextMemberNumber(): number {
  let max = 0;
  for (const profile of store.profiles) {
    if (!profile.memberNo.startsWith(memberNoPrefix)) continue;
    const suffix = Number.parseInt(
      profile.memberNo.slice(memberNoPrefix.length),
      10,
    );
    if (Number.isFinite(suffix) && suffix > max) max = suffix;
  }
  return max + 1;
}

function formatMemberNo(value: number): string {
  return `${memberNoPrefix}${String(value).padStart(3, "0")}`;
}

export async function registerMember(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<RegisterResult> {
  if (dataMode === "supabase") {
    return {
      ok: false,
      code: "adapter_unavailable",
      message:
        "Pendaftaran via Supabase Auth belum tersedia. Gunakan mode mock.",
    };
  }
  const needle = input.email.trim().toLowerCase();
  const existing = store.profiles.find(
    (p: Profile) => p.email.toLowerCase() === needle,
  );
  if (existing) {
    return {
      ok: false,
      code: "email_taken",
      message:
        "Email ini sudah terdaftar. Gunakan menu masuk atau pemulihan kata sandi.",
    };
  }
  const next = nextMemberNumber();
  const profile: Profile = {
    id: `usr-m${String(next).padStart(3, "0")}`,
    memberNo: formatMemberNo(next),
    email: needle,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    avatarUrl: null,
    role: "member",
    membershipStatus: "pending",
    volunteerApprovalStatus: "pending",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  store.profiles.push(profile);
  store.accounts.push({
    profileId: profile.id,
    email: needle,
    password: input.password,
  });
  return { ok: true, memberNo: profile.memberNo };
}

export async function requestPasswordRecovery(
  email: string,
): Promise<RecoveryResult> {
  if (dataMode === "supabase") {
    return {
      ok: false,
      code: "adapter_unavailable",
      message:
        "Pemulihan kata sandi via Supabase Auth belum tersedia. Gunakan mode mock.",
    };
  }
  const needle = email.trim().toLowerCase();
  const profile = store.profiles.find(
    (p: Profile) => p.email.toLowerCase() === needle,
  );
  if (!profile) {
    return {
      ok: false,
      code: "email_not_registered",
      message:
        "Email ini belum terdaftar pada aplikasi. Daftar member terlebih dahulu atau periksa kembali penulisan email.",
    };
  }
  return { ok: true, delivered: "mock_simulation" };
}

export interface ChangePasswordResult {
  ok: boolean;
  code: string;
  message: string;
}

export async function changeAccountPassword(
  userId: string,
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  if (dataMode === "supabase") {
    return {
      ok: false,
      code: "adapter_unavailable",
      message: "Adapter Supabase Auth belum tersedia. Gunakan mode mock.",
    };
  }
  const profile = store.profiles.find((p: Profile) => p.id === userId);
  if (!profile || profile.email.toLowerCase() !== email.trim().toLowerCase()) {
    return {
      ok: false,
      code: "session_mismatch",
      message: "Sesi tidak cocok dengan akun. Masuk kembali.",
    };
  }
  if (resolveMockLoginPassword(email) !== currentPassword) {
    return {
      ok: false,
      code: "wrong_password",
      message: "Kata sandi saat ini tidak cocok.",
    };
  }
  const existing = store.accounts.find((a) => a.profileId === userId);
  if (existing) {
    existing.password = newPassword;
  } else {
    store.accounts.push({
      profileId: userId,
      email: profile.email.toLowerCase(),
      password: newPassword,
    });
  }
  return { ok: true, code: "password_updated", message: "Kata sandi diperbarui." };
}
