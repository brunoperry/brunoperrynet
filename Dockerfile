#FROM alpine
FROM arm64v8/alpine

RUN apk --no-cache add --virtual builds-deps build-base python3
RUN apk --no-cache add --update npm
RUN npm install pm2 -g

# Setup project structure
COPY src/configs /app/src/configs
COPY src/models /app/src/models
COPY src/routes /app/src/routes
COPY src/system_service.js /app/src/system_service.js
COPY .env /app/.env
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY server.js /app/server.js
WORKDIR /app

# Build project code (in the image itself)
RUN npm ci

# Run app
CMD npm run production
