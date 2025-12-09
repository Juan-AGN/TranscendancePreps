FROM node:24

WORKDIR /app

COPY content/. ./

RUN npm install

RUN npm run build

EXPOSE 8888

CMD ["npm", "run", "start"]