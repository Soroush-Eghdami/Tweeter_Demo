FROM node:24.8.0-alpine

WORKDIR /app

RUN npm config set registry https://registry.npmjs.org/

COPY package*.json .
RUN npm install
COPY . .

EXPOSE 5173

ENV BASE_API_URL=http://127.0.0.1:8000/api

CMD [ "npm", "run", "dev" ]