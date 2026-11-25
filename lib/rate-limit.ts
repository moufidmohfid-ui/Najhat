import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rl = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(3, "1 d"),
  prefix: "wathaiqi",
});

export async function checkLimit(ip: string) {
  const r = await rl.limit(ip);
  return { ok: r.success, remaining: r.remaining };
}
