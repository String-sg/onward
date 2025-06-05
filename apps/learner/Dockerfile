# ----------------------------------------
# Base Stage
# ----------------------------------------
FROM node:22.16.0-alpine3.21 AS base

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV="production"

# Install `pnpm`.
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir $PNPM_HOME && \
        wget -qO- "https://github.com/pnpm/pnpm/releases/download/v10.11.0/pnpm-linuxstatic-arm64" > "$PNPM_HOME/pnpm" && \
        chmod +x $PNPM_HOME/pnpm && \
        ln -s $PNPM_HOME/pnpm /usr/local/bin/pnpm

# ----------------------------------------
# Build Stage
# ----------------------------------------
FROM base as build

# Skip `postinstall` script of `@prisma/client` during installation.
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Fetch all dependencies into the virtual store.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches patches
RUN pnpm fetch

COPY . .

# Install dependencies.
RUN pnpm install --offline

# Build internal dependencies.
RUN pnpm bootstrap

# Generate database client.
RUN pnpm db:generate

# Build learner app.
RUN pnpm --filter="learner" build

# Install production dependencies.
RUN find . -type d -name "node_modules" -prune -exec rm -rf {} +
RUN pnpm --filter="learner" install --offline --prod

# ----------------------------------------
# Production Stage
# ----------------------------------------
FROM base AS production

RUN apk add --no-cache ca-certificates

# 1. Create a new user named `zero`.
# 2. Change the permission of `app` folder to user `zero`.
# 3. Change the current user from `root` to `zero`.
RUN addgroup -S zero && \
        adduser -S zero -G zero && \
        chown zero:zero /app

USER zero

COPY --from=build --chown=zero:zero /app/package.json ./package.json
COPY --from=build --chown=zero:zero /app/node_modules ./node_modules
COPY --from=build --chown=zero:zero /app/prisma ./prisma

COPY --from=build --chown=zero:zero /app/apps/learner/package.json ./apps/learner/package.json
COPY --from=build --chown=zero:zero /app/apps/learner/node_modules ./apps/learner/node_modules
COPY --from=build --chown=zero:zero /app/apps/learner/build ./apps/learner/build

EXPOSE 3000

CMD ["node", "apps/learner/build/index.js"]
