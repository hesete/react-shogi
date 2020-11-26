
# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.3 -g --silent
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# new
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# docker build -f Dockerfile.prod -t hesete/react-shogi:prod .
# docker run -it --rm -p 1337:80 hesete/react-shogi:prod

# docker login registry.gitlab.com
# docker build -f Dockerfile.prod -t registry.gitlab.com/hesete/react-shogi:prod .
# docker push registry.gitlab.com/hesete/react-shogi:prod

# docker pull registry.gitlab.com/hesete/react-shogi:prod


