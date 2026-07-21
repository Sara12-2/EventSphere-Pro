# Dev-oriented image: runs the Vite dev server with source bind-mounted
# for hot reload (see ../docker-compose.yml). Not a production image.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
