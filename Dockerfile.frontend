FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY app ./app
COPY public ./public
COPY middleware.ts ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY global.d.ts ./

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]