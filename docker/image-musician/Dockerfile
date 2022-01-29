FROM node:17-alpine

COPY js /opt/app/

WORKDIR /opt/app/

RUN npm install rfc4122

ENTRYPOINT ["node", "/opt/app/main.js"]