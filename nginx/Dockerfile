FROM debian:bullseye

RUN apt update -y && apt upgrade -y

RUN apt install nginx -y

RUN apt install openssl -y

RUN mkdir -p /etc/nginx/ssl/

RUN openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/transcendence.42.fr.key -out /etc/nginx/ssl/transcendence.42.fr.crt -sha256 -nodes -subj "/C=ES/ST=Andalucia/L=Malaga/O=42Students/OU=Student/CN=transcendence.42.fr"

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

EXPOSE 443

CMD [ "nginx", "-g", "daemon off;" ]