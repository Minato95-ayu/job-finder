import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "enterprise-secret-key-change-me";

// Production Security Headers
export const securityMiddleware = helmet();

// Distributed Rate Limiting (Should use RedisStore in real production)
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// JWT Authentication Middleware
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Missing or invalid token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn({ err }, "Failed authentication attempt");
    res.status(401).json({ error: "Invalid token." });
  }
};

// Centralized Error Handling
export const errorHandler = (err, req, res, next) => {
  logger.error(err, "Unhandled API Exception");
  res.status(500).json({
    error: "Internal Server Error",
    requestId: req.id, // In real FAANG infra, you'd have a correlation ID
  });
};
