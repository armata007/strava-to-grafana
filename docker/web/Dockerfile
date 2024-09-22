FROM node:22.8.0 as builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app
COPY . .
RUN pnpm install --dev
RUN pnpm run build

FROM node:22.8.0

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist/
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/pnpm-lock.yaml .
COPY --from=builder /usr/src/app/prisma .
COPY --from=builder /usr/src/app/.env .
COPY --from=builder /usr/src/app/.env.generated .
RUN pnpm install --prod
CMD [ "pnpm", "run" ,"start:prod" ]
