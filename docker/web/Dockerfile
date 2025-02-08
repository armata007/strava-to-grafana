FROM node:22.8.0 as builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack --version
RUN corepack enable
RUN npm install -g corepack@latest
RUN pnpm --version
RUN corepack prepare pnpm@latest --activate
RUN pnpm --version


WORKDIR /usr/src/app
COPY package.json .
COPY pnpm-lock.yaml .
COPY prisma .
RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:22.8.0

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack --version
RUN corepack enable
RUN npm install -g corepack@latest
RUN pnpm --version
RUN corepack prepare pnpm@latest --activate
RUN pnpm --version

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist/
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/pnpm-lock.yaml .
COPY --from=builder /usr/src/app/prisma .
COPY --from=builder /usr/src/app/.env .
COPY --from=builder /usr/src/app/.env.generated .
COPY --from=builder /usr/src/app/node_modules .
RUN pnpm install
CMD [ "pnpm", "run" ,"prod" ]
