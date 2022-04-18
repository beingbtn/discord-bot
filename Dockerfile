FROM node:latest

WORKDIR /usr/src/app

ADD . /usr/src/app

RUN npm install --production

RUN npm run prerun

CMD ["npm","run","docker"]