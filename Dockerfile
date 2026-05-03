FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the source code
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects telemetry - disable it
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy secret so Payload config doesn't crash at build time
# (real secret is injected at runtime via Zeabur env vars)
ENV PAYLOAD_SECRET=build-time-placeholder
ENV NEXT_PUBLIC_SITE_URL=https://asahihuuhu.zeabur.app

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets and uploads
COPY --from=builder /app/public ./public

# Create uploads directory with correct permissions
RUN mkdir -p ./public/uploads && chown nextjs:nodejs ./public/uploads

# Copy Next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
