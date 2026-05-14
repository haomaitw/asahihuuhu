FROM node:20-alpine AS base

# ── deps: install node_modules ───────────────────────────────────
FROM base AS deps
# libc6-compat: glibc compat layer (needed for pre-built native binaries on Alpine)
# python3 make g++: needed for pg and other native addons (NOT vips — that forces sharp to compile from source)
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── builder: Next.js production build ────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_SECRET=build-time-placeholder
ENV NEXT_PUBLIC_SITE_URL=https://asahihuuhu.zeabur.app
# Force DB connections to fail fast (connection refused) during build.
# Without this, if Zeabur injects POSTGRES_URI into the build environment,
# page data collection hangs for 15+ min waiting for TCP timeout.
# Zeabur overrides these with real values at runtime.
ENV POSTGRES_URI=postgresql://127.0.0.1:5432/build_placeholder
ENV DATABASE_URL=postgresql://127.0.0.1:5432/build_placeholder

RUN npm run build

# ── runner: minimal production image ─────────────────────────────
FROM base AS runner
# libc6-compat needed so pre-built sharp binary (bundled libvips) loads correctly
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir -p ./public/uploads && chown nextjs:nodejs ./public/uploads

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# sharp uses a pre-built binary with bundled libvips — must be copied separately
# because Next.js standalone output trace often misses native .node files
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp

# ESM loader hooks: stub .css imports from Node.js-external packages at runtime.
# @payloadcms/ui (in serverExternalPackages) pulls in react-image-crop which does
# import './dist/ReactCrop.css'. Node.js ESM throws ERR_UNKNOWN_FILE_EXTENSION on
# .css files, crashing every Payload admin page. The hooks return an empty module.
COPY --from=builder --chown=nextjs:nodejs /app/src/css-noop-register.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/src/css-noop-hooks.mjs ./

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "--import", "./css-noop-register.mjs", "server.js"]
