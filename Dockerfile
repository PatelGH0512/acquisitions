FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.js ./

EXPOSE 3000

CMD ["npm", "run", "start"]
