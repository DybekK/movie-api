FROM node:alpine

WORKDIR /movie-api

COPY ./package.json ./
COPY . .

RUN npm install
CMD ["npm", "run", "start"]
