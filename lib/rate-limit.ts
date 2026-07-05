import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _ratelimit: Ratelimit | undefined;

/**
 * Lazily-initialized rate limiter. Not wired into any route yet — no API
 * routes exist. Call getRateLimiter() from inside a route handler when one
 * needs limiting; safe to import anywhere since the client is only built on
 * first call.
 */
export function getRateLimiter(): Ratelimit {
  if (_ratelimit) return _ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL/TOKEN not set. getRateLimiter() must only be " +
        "called at request time from a route that needs limiting."
    );
  }

  _ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "concierge",
  });
  return _ratelimit;
}
