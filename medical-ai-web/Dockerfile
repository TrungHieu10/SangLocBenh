# Stage 1: Build React/Vite app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Chúng ta dùng Nginx Reverse Proxy nên biến VITE_API_URL chỉ cần trỏ về '/api'
ENV VITE_API_URL=/api
# Đọc Client ID từ build args thay vì hardcode
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy file build từ stage 1
COPY --from=build /app/dist /usr/share/nginx/html
# Ghi đè cấu hình mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
