import { Queue } from "bullmq";
import redisConnection from "../config/Redis.js";

export const emailQueue = new Queue("email", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 100
    },
});