# source: https://pnpm.io/docker
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g corepack@latest
RUN corepack enable
RUN corepack use pnpm@9.x

COPY . /app
WORKDIR /app

RUN rm -f -R node_modules && rm -f -R dist
RUN pnpm install

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm run build

# source: https://github.com/open-pioneer/trails-starter/blob/b901ecdcc8d3c5352c5eb650e43311f7cf8e2bfe/docs/tutorials/HowToDeployAnApp.md?plain=1#L32
FROM caddy:alpine
COPY --from=build /app/dist/www /srv/web/
#COPY Caddyfile /etc/caddy/Caddyfile