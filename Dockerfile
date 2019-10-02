FROM node:10

# Create unilog directory
WORKDIR /usr/src/unilog

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
EXPOSE 3000

CMD [ "node", "src/server.js" ]
