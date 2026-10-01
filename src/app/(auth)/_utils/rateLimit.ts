import { getRedis } from "../../../../lib/redis";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

const RATE_LIMIT_SCRIPT = `
  local current = redis.call("INCR", KEYS[1])

  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  local ttl = redis.call("TTL", KEYS[1])
  local limit = tonumber(ARGV[2])

  local allowed = 1

  if current > limit then
    allowed = 0
  end

  local remaining = math.max(0, limit - current)

  return { allowed, remaining, ttl }
`;

export const rateLimit = async ({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<RateLimitResult> => {
  const redis = await getRedis();

  const result = await redis.eval(RATE_LIMIT_SCRIPT, {
    keys: [key],
    arguments: [
      windowSeconds.toString(),
      limit.toString(),
    ],
  });

  const [allowed, remaining, retryAfter] =
    result as [number, number, number];

  return {
    allowed: allowed === 1,
    remaining,
    retryAfter,
  };
};