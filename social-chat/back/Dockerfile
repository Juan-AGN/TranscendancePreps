FROM node:20-alpine

WORKDIR /app

COPY content/package*.json ./
RUN npm ci

COPY content/ ./
RUN npm run build

EXPOSE 8890
CMD ["npm", "start"]