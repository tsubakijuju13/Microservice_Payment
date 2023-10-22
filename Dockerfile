FROM node:18-slim

WORKDIR /aplicacion
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 6800
CMD [ "npm", "start" ]