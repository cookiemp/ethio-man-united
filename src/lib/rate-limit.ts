/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using a Redis-based solution like Upstash
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if an IP address has exceeded the rate limit
   * @param identifier - Usually IP address or user identifier
   * @returns Object with isLimited flag and retry info
   */
  check(identifier: string): {
    isLimited: boolean;
    remaining: number;
    resetAt: Date | null;
  } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    // No previous attempts or window expired
    if (!entry || now > entry.resetAt) {
      this.attempts.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return {
        isLimited: false,
        remaining: this.maxAttempts - 1,
        resetAt: new Date(now + this.windowMs),
      };
    }

    // Increment attempt count
    entry.count++;
    this.attempts.set(identifier, entry);

    const isLimited = entry.count > this.maxAttempts;
    const remaining = Math.max(0, this.maxAttempts - entry.count);

    return {
      isLimited,
      remaining,
      resetAt: new Date(entry.resetAt),
    };
  }

  /**
   * Reset rate limit for an identifier (e.g., on successful login)
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetAt) {
        this.attempts.delete(key);
      }
    }
  }

  /**
   * Get current stats (useful for monitoring)
   */
  getStats() {
    return {
      totalTracked: this.attempts.size,
      maxAttempts: this.maxAttempts,
      windowMs: this.windowMs,
    };
  }
}

// Singleton instance for admin login
// 5 attempts per 15 minutes per IP
export const adminLoginLimiter = new RateLimiter(5, 15 * 60 * 1000);

// Helper function to get client IP from request
export function getClientIp(request: Request): string {
  // Check common headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback (shouldn't happen in production)
  return 'unknown';
}
