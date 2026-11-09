FROM node:24-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./

RUN npm ci

COPY index.html vite.config.ts tsconfig*.json ./
COPY src ./src

RUN npm run build

FROM nginx:alpine AS runner

# Configura suporte a SPA (React Router) para evitar erro 404 ao recarregar rotas como /login
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]