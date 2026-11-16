# -------------------------------------------------------------
# SkyGuard Node.js API Gateway Container
# -------------------------------------------------------------
FROM node:22-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Ensure data directory exists for SQLite WAL persistence
RUN mkdir -p /app/data

EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
