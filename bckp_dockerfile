FROM arm64v8/ubuntu
#FROM ubuntu
SHELL [ "/bin/bash", "--login", "-c" ]
RUN apt update
RUN apt install nodejs -y
RUN nodejs -v
RUN apt install npm -y
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

# specify the command to run when the image is started
CMD npm run production