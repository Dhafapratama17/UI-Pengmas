import type { AuthSession } from "@/types/auth";

const SESSION_SECRET = process.env.SESSION_SECRET;

const SESSION_VERSION = "v1";

function getSecret(): Uint8Array {
  if (!SESSION_SECRET) {
    if (process.env.NEXT_PUBLIC_DATA_MODE === "supabase") {
      throw new Error(
        "SESSION_SECRET wajib diisi saat data mode supabase aktif.",
      );
    }
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_APP_ENV === "production"
    ) {
      throw new Error(
        "SESSION_SECRET wajib diisi untuk mode production.",
      );
    }
    return new TextEncoder().encode(
      "retemali-dev-only-do-not-use-in-production",
    );
  }
  return new TextEncoder().encode(SESSION_SECRET);
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  return Buffer.from(base64, "base64").toString("utf8");
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    getSecret() as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmacVerify(data: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    getSecret() as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  let sigBase64 = signature.replace(/-/g, "+").replace(/_/g, "/");
  while (sigBase64.length % 4 !== 0) sigBase64 += "=";
  const sigBytes = Uint8Array.from(atob(sigBase64), (c) => c.charCodeAt(0));
  return crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(data),
  );
}

export async function signSession(session: AuthSession): Promise<string> {
  const payload = {
    v: SESSION_VERSION,
    d: session,
  };
  const payloadJson = JSON.stringify(payload);
  const signature = await hmacSign(payloadJson);
  return `${base64UrlEncode(payloadJson)}.${signature}`;
}

export async function verifySession(
  token: string | undefined,
): Promise<AuthSession | null> {
  if (!token) return null;
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex <= 0) return null;

  const payloadPart = token.slice(0, dotIndex);
  const signaturePart = token.slice(dotIndex + 1);

  let payloadJson: string;
  try {
    payloadJson = base64UrlDecode(payloadPart);
  } catch {
    return null;
  }

  const valid = await hmacVerify(payloadJson, signaturePart);
  if (!valid) return null;

  let parsed: { v?: string; d?: Partial<AuthSession> };
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    return null;
  }

  if (parsed.v !== SESSION_VERSION || !parsed.d) return null;

  const session = parsed.d as AuthSession;
  if (
    typeof session.userId !== "string" ||
    typeof session.email !== "string" ||
    typeof session.fullName !== "string" ||
    (session.role !== "member" &&
      session.role !== "volunteer" &&
      session.role !== "admin") ||
    session.sessionKind !== "mock" ||
    typeof session.issuedAt !== "string" ||
    typeof session.expiresAt !== "string"
  ) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  return session;
}
