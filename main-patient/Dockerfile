# Stage 1: Build the React app
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# The official nginx image substitutes only these runtime proxy variables.
# They can be overridden by Docker/Cloud Run without rebuilding the frontend.
ENV NGINX_ENVSUBST_FILTER="AUTH_PROXY_TARGET|BACKEND_PROXY_TARGET|DPD_PROXY_TARGET|SWINTINY_PROXY_TARGET|CLIP_VITB16_PROXY_TARGET|TRANSCRIPTION_PROXY_TARGET|SMS_PROXY_TARGET|CHATBOX_PROXY_TARGET|CHAT_SERVICE_TARGET"
ENV AUTH_PROXY_TARGET="https://auth-service-338917524320.northamerica-northeast1.run.app" \
    BACKEND_PROXY_TARGET="https://main-service-git-223812018767.northamerica-northeast1.run.app" \
    DPD_PROXY_TARGET="https://drugbank-service-338917524320.northamerica-northeast1.run.app" \
    SWINTINY_PROXY_TARGET="https://swintiny-service-338917524320.northamerica-northeast1.run.app" \
    CLIP_VITB16_PROXY_TARGET="https://clip-vitb16-service-338917524320.northamerica-northeast1.run.app" \
    TRANSCRIPTION_PROXY_TARGET="http://host.docker.internal:5004" \
    SMS_PROXY_TARGET="http://host.docker.internal:5003" \
    CHATBOX_PROXY_TARGET="http://host.docker.internal:5005" \
    CHAT_SERVICE_TARGET="https://vercel-chat-alpha.vercel.app"

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
