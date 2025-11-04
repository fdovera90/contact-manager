FROM node:20-alpine

WORKDIR /app

# Allow passing API URL at build time so it gets baked into the client bundle
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]