export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

// In-memory store — sufficient for single-instance dev/prod.
// Replace with Redis (ioredis/upstash) for multi-instance deployments.
const store = new Map<string, WindowEntry>();

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, limit: config.limit, remaining: config.limit - 1, resetAt };
  }

  entry.count += 1;
  const remaining = Math.max(0, config.limit - entry.count);
  return {
    allowed: entry.count <= config.limit,
    limit: config.limit,
    remaining,
    resetAt: entry.resetAt,
  };
}
