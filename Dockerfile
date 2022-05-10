FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY ./ /app/
# Unmet peer dependencies occurs but seems not to break the app
RUN pnpm install || true
# Suggested by Next.js if you use next/image
RUN pnpm add sharp
RUN pnpm build
ENTRYPOINT [ "pnpm", "run", "start" ]
EXPOSE 3000
