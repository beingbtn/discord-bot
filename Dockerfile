FROM node:latest

WORKDIR /usr/src/app

ADD . /usr/src/app

RUN npm install

RUN npm run build

RUN npm prune --production

CMD ["npm","run","docker"]