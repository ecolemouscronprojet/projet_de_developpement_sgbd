FROM node:14.5.0-stretch As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g nodemon

RUN npm install

COPY  . .

EXPOSE 5000

CMD ["node", "server.js"]