FROM node:12.12.0

WORKDIR /var/workspace

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3001