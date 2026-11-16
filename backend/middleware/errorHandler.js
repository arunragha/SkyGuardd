export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/telemetry/stream') {
      const statusColor = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`[HTTP] ${req.method} ${req.path} ${statusColor}${res.statusCode}\x1b[0m (${duration}ms)`);
    }
  });
  next();
}

export function centralizedErrorHandler(err, req, res, next) {
  console.error('[API-ERROR]', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString()
  });
}
