# Base stage
FROM node:20-alpine AS base
RUN npm install -g pnpm turbo
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Prune stage
FROM base AS pruner
COPY . .
RUN turbo prune @amisimedos/web --docker

# Installer stage
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build stage
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN turbo run build --filter=@amisimedos/web

# Runner stage
FROM base AS runner
ENV NODE_ENV=production
COPY --from=installer /app .

# Expose ports
EXPOSE 3000

# Start command
CMD ["pnpm", "run", "start", "--filter", "@amisimedos/web"]
