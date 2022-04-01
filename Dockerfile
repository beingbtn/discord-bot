FROM node:latest

WORKDIR /usr/src/app

COPY package.json .

RUN npm install --production

ADD . /usr/src/app

CMD ["npm","run","docker"]