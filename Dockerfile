FROM buildkite/puppeteer

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .

RUN npm install
RUN npm run build

ENV LOG_LEVEL=info

ENTRYPOINT [ "node", "dist/index.js" ]
