FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y alsa-utils libasound2-dev
RUN npm install

# Bundle app source
COPY . .
COPY .asoundrc /root

ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "start" ]
