# ----------------------------------------
# Base Stage
# ----------------------------------------
FROM node:22.22.0-alpine3.22 AS base

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV="production"

# Install `pnpm`.
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir $PNPM_HOME && \
        wget -qO- "https://github.com/pnpm/pnpm/releases/download/v10.18.1/pnpm-linuxstatic-arm64" > "$PNPM_HOME/pnpm" && \
        chmod +x $PNPM_HOME/pnpm && \
        ln -s $PNPM_HOME/pnpm /usr/local/bin/pnpm

# ----------------------------------------
# Build Stage
# ----------------------------------------
FROM base AS build

# Skip `postinstall` script of `@prisma/client` during installation.
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Fetch all dependencies into the virtual store.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN pnpm fetch

COPY . .

# Install dependencies.
RUN pnpm install --offline

# Generate database client.
RUN pnpm db:generate

# Build the app.
RUN pnpm build

# Install production dependencies.
RUN find . -type d -name "node_modules" -prune -exec rm -rf {} +
RUN pnpm install --offline --prod

# ----------------------------------------
# Production Stage
# ----------------------------------------
FROM base AS production

RUN apk add --no-cache ca-certificates

# Download SSL certificate bundle.
RUN wget https://truststore.pki.rds.amazonaws.com/ap-southeast-1/ap-southeast-1-bundle.pem -O /etc/ssl/certs/rds-ca-bundle.pem

# 1. Create a new user named `zero`.
# 2. Change the permission of `app` folder to user `zero`.
# 3. Change the current user from `root` to `zero`.
RUN addgroup -S zero && \
        adduser -S zero -G zero && \
        chown zero:zero /app

USER zero

COPY --from=build --chown=zero:zero /app/package.json ./package.json
COPY --from=build --chown=zero:zero /app/node_modules ./node_modules
COPY --from=build --chown=zero:zero /app/build ./build
COPY --from=build --chown=zero:zero /app/prisma ./prisma
COPY --from=build --chown=zero:zero /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["node", "build/index.js"]
