// In-memory sliding window rate limiter
const ipRequestCounts = new Map();

export function rateLimiter({ windowMs = 60000, max = 120, message = 'Too many requests. Please try again later.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown-client';
    const now = Date.now();

    let clientRecord = ipRequestCounts.get(ip);
    if (!clientRecord || now - clientRecord.windowStart > windowMs) {
      clientRecord = { windowStart: now, count: 1 };
      ipRequestCounts.set(ip, clientRecord);
      return next();
    }

    clientRecord.count++;
    if (clientRecord.count > max) {
      const retryAfter = Math.ceil((clientRecord.windowStart + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSec: retryAfter
      });
    }

    next();
  };
}

// Cleanup stale rate limit records every 5 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now - record.windowStart > 300000) {
      ipRequestCounts.delete(ip);
    }
  }
}, 300000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}
