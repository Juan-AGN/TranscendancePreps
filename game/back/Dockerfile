FROM node:24

WORKDIR /app

RUN openssl req -x509 -newkey rsa:4096 -keyout gameback.key -out gameback.crt -sha256 -nodes -subj "/C=ES/ST=Andalucia/L=Malaga/O=42Students/OU=Student/CN=gameback"

COPY content/package*.json ./

RUN npm install

COPY content/. ./

RUN npm run build

EXPOSE 8888

CMD ["npm", "run", "start"]