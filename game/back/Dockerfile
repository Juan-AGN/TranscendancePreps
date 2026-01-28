FROM node:24

WORKDIR /app

COPY content/package*.json ./

RUN npm install

COPY content/. ./

RUN npm run build

EXPOSE 8888

CMD ["npm", "run", "start"]