import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL,
  });

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function getRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }

  return redis;
}