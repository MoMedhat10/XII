import { createClient, type RedisClientType } from "redis";
import { logger } from "./pino";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy() {
        logger.info("Redis reconnecting");
        return 60_000;
      },
    },
  });

redis.on("error", (error) => {
  logger.error(error, "Redis error");
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("reconnecting", () => {
  logger.info("Redis reconnecting");
});

redis.on("disconnect", () => {
  logger.error("Redis disconnected");
});

redis.on("end", () => {
  logger.info("Redis disconnected");
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