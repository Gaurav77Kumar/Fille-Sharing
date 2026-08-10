import Redis from "ioredis";

const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export default redisConnection;