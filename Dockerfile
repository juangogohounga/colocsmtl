# syntax = docker/dockerfile:1
#
# Builds ColocsMTL and serves it with nginx.
#   docker build \
#     --build-arg VITE_SUPABASE_URL=https://xxxx.supabase.co \
#     --build-arg VITE_SUPABASE_ANON_KEY=... \
#     -t colocsmtl .
#   docker run -p 8080:80 colocsmtl

ARG NODE_VERSION=22.13.1

FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app

# Vite bakes these into the bundle at build time.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

COPY package-lock.json package.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
