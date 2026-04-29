FROM node:20-alpine AS builder
# Set working directory
WORKDIR /app
RUN npm install -g pnpm turbo

# Copy monorepo files
COPY . .

# Prune for sync package
RUN turbo prune @amisimedos/sync --docker

FROM node:20-alpine AS installer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@amisimedos/sync...

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm

# Only copy over the built files and dependencies
COPY --from=installer /app .

# Start the sync engine
CMD ["pnpm", "--filter", "@amisimedos/sync", "start"]
