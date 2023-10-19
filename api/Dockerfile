FROM --platform=linux/amd64 node:18

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY . .

EXPOSE 4000

CMD ["npm", "run", "serve"]
