FROM node:alpine

RUN apk update && apk add yarn

# Create app directory
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/log

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./

RUN yarn

# Bundle app source
COPY . .

ENV LOG_LEVEL=info

CMD [ "yarn", "start" ]
