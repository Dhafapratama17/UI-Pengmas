import type { UserRole } from "@/types/db";

export type LoginAccessMode = "member" | "volunteer" | "admin";

export type AuthErrorCode =
  | "invalid_credentials"
  | "role_mismatch"
  | "volunteer_not_approved"
  | "email_taken"
  | "email_not_registered"
  | "adapter_unavailable";

export type RegisterResult =
  | { ok: true; memberNo: string }
  | { ok: false; code: AuthErrorCode; message: string };

export type RecoveryResult =
  | { ok: true; delivered: "mock_simulation" | "supabase_email" }
  | { ok: false; code: AuthErrorCode; message: string };

export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  issuedAt: string;
  expiresAt: string;
  sessionKind: "mock";
}

export type AuthResult =
  | { ok: true; session: AuthSession }
  | { ok: false; code: AuthErrorCode; message: string };
