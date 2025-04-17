# Development stage
FROM node:23-alpine3.20 AS development

WORKDIR /server

COPY package*.json ./

RUN npm install

RUN npm install -g nodemon

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production starge
FROM node:23-alpine3.20 AS production

WORKDIR /server

COPY package*.json ./

RUN npm install

RUN npm install -g typescript

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

