FROM node:12

EXPOSE 2205

WORKDIR /opt/app

# Copy only json to take advantage of cached Docker layers.
COPY ["src/package.json", "src/package-lock.json", "./"]
RUN npm install

COPY src .

ENTRYPOINT [ "node", "index.js" ]