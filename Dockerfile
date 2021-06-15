FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y alsa-utils libasound2-dev
RUN npm install

# Bundle app source
COPY . .
COPY .asoundrc /root

# Jarvis cache
RUN mkdir /tmp/jarviscache && chmod 777 /tmp/jarviscache

ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "start" ]