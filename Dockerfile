# -------------------------
# 1. Builder Stage
# -------------------------
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN node -e " \
  const fs = require('fs'); \
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8')); \
  delete lock.packages['node_modules/@next/swc-win32-x64-msvc']; \
  fs.writeFileSync('package-lock.json', JSON.stringify(lock, null, 2)); \
  "
RUN npm ci
COPY . .
RUN npm run build

# -------------------------
# 2. Production Stage
# -------------------------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/next.config.* ./
EXPOSE 3000
USER appuser
CMD ["node_modules/.bin/next", "start"]
