FROM node:12.14.1

RUN mkdir -p /app
WORKDIR /app
ADD ./ /app

RUN npm i -g npm
RUN npm i -g pm2
RUN pm2 install pm2-logrotate
RUN npm install
RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
