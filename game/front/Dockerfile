FROM node:24

WORKDIR /app

COPY my-app/package*.json ./

RUN npm install

COPY my-app/public ./public

COPY my-app/src ./src

EXPOSE 3000

CMD ["npm", "start"]