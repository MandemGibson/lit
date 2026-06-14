FROM node:18.15.0-alpine


WORKDIR /app 

COPY package.json package-lock.json ./
 

RUN npm install 

COPY . .

EXPOSE 8080

RUN npm run build

CMD ["npm", "run", "serve"]
