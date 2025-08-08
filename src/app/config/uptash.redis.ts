import { Redis } from "ioredis";

export const connectUpstash = (redisUrl: string) => {
  const redis = new Redis(redisUrl);

  redis.on("connect", () => {
    console.log("✅ Connected to Upstash Redis");
  });

  redis.on("error", (err) => {
    console.error("❌Upstash Redis Error:", err);
  });

  return redis;
};
