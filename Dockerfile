FROM node:20-alpine AS base

# ── deps: install all node_modules ──────────────────────────────
FROM base AS deps
# libc6-compat + build tools for native modules (sharp, pg, etc.)
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── builder: compile Next.js ─────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat vips-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder values so Payload config doesn't crash at build time
ENV PAYLOAD_SECRET=build-time-placeholder
ENV NEXT_PUBLIC_SITE_URL=https://asahihuuhu.zeabur.app

RUN npm run build

# ── runner: minimal production image ────────────────────────────
FROM base AS runner
# Runtime deps for sharp (libvips) and native node modules
RUN apk add --no-cache libc6-compat vips
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Public assets
COPY --from=builder /app/public ./public

# Uploads directory
RUN mkdir -p ./public/uploads && chown nextjs:nodejs ./public/uploads

# Standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# sharp must be available at runtime — copy from deps stage
# (standalone output excludes native binaries from the trace)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
