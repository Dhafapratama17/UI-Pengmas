export interface RateLimitStore {
  get(key: string): { count: number; resetAt: number } | null;
  set(key: string, value: { count: number; resetAt: number }): void;
  increment(key: string, windowMs: number): { count: number; resetAt: number };
  delete(key: string): void;
}

export interface MemoryRateLimitEntry {
  count: number;
  resetAt: number;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, MemoryRateLimitEntry>();

  get(key: string): { count: number; resetAt: number } | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: { count: number; resetAt: number }): void {
    this.store.set(key, value);
  }

  increment(key: string, windowMs: number): { count: number; resetAt: number } {
    const now = Date.now();
    const existing = this.store.get(key);
    if (existing && now < existing.resetAt) {
      existing.count += 1;
      this.store.set(key, existing);
      return existing;
    }
    const entry: MemoryRateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    this.store.set(key, entry);
    return entry;
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export class RateLimiter {
  constructor(
    private store: RateLimitStore,
    private limit: number,
    private windowMs: number,
  ) {}

  check(key: string): RateLimitResult {
    const entry = this.store.increment(key, this.windowMs);
    const allowed = entry.count <= this.limit;
    return {
      allowed,
      remaining: Math.max(0, this.limit - entry.count),
      resetAt: entry.resetAt,
      limit: this.limit,
    };
  }
}

export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      message: "Terlalu banyak permintaan. Coba lagi nanti.",
      rateLimit: {
        limit: result.limit,
        remaining: result.remaining,
        resetAt: new Date(result.resetAt).toISOString(),
      },
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(
          Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000)),
        ),
      },
    },
  );
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/*
 * KETERBATASAN: Implementasi ini menggunakan penyimpanan in-memory (Map).
 * Rate limit tidak akan dibagi antara multiple instance server dan akan
 * hilang saat server restart. Untuk production yang terdistribusi,
 * ganti MemoryRateLimitStore dengan implementasi yang menggunakan Redis
 * atau penyimpanan terpusat lainnya melalui antarmuka RateLimitStore.
 */
