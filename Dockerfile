# Multi-stage Dockerfile for MindBloom monorepo (client + server)
# Uses Node 20 to be compatible with Prisma 5.x

# ---------- Builder ----------
FROM node:20-slim AS builder
WORKDIR /app

# Install system deps if needed (kept minimal)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifests first for better layer caching
COPY package.json package-lock.json* ./

# Copy Prisma schema so prisma generate works during install/build
COPY prisma ./prisma

# Install deps (respects package-lock if present)
RUN npm ci

# Copy source code
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY attached_assets ./attached_assets
COPY tsconfig.json vite.config.ts ./

# Build (runs prisma generate via postinstall and our build script)
RUN npm run build

# ---------- Runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy runtime artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Expose the port used by the server (server/index.ts defaults to PORT or 5000)
EXPOSE 5000

# Ensure Prisma is ready in the runtime image; attempt migrate deploy, fallback to db push
CMD ["sh", "-c", "npx prisma generate && (npx prisma migrate deploy || npx prisma db push) && node dist/index.js"]
