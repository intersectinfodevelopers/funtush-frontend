# -------------------------
# 1. Builder Stage
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Build Next.js app
RUN npm run build


# -------------------------
# 2. Production Stage
# -------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user (security best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

# If you have env files (optional)
# COPY --from=builder /app/.env ./.env

EXPOSE 3000

USER appuser

CMD ["npm", "start"]