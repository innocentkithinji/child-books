FROM --platform=linux/amd64 node:18 as build-stage

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --pure-lockfile
COPY . .
ARG REACT_APP_GRAPHQL_URL
ENV REACT_APP_GRAPHQL_URL=$REACT_APP_GRAPHQL_URL
RUN yarn run build

FROM --platform=linux/amd64 nginx:alpine
COPY --from=build-stage /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]