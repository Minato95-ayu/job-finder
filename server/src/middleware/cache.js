import IORedis from "ioredis";
import logger from "../utils/logger.js";

const redis = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

export const cacheMiddleware = (duration) => async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();

  const key = `cache:${req.originalUrl || req.url}`;
  
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      logger.info({ key }, "Cache hit");
      return res.json(JSON.parse(cachedData));
    }

    res.originalJson = res.json;
    res.json = (body) => {
      redis.set(key, JSON.stringify(body), "EX", duration);
      res.originalJson(body);
    };
    next();
  } catch (err) {
    logger.warn(err, "Caching layer failed, falling back to database");
    next();
  }
};
