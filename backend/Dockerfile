# ============================================================================
# Stage 1: Install dependencies
# ============================================================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ============================================================================
# Stage 2: Build the application
# ============================================================================
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN pnpm build

# ============================================================================
# Stage 3: Production image
# ============================================================================
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/generated ./generated

# Copy Prisma schema, migrations, and config (needed for runtime migrations)
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT ["./entrypoint.sh"]
