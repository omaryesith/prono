FROM node:20-alpine AS build

WORKDIR /app

# Copy only package.json to leverage Docker cache
COPY ./frontend/package.json ./frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY ./frontend ./

# Build for production (generates 'dist' folder)
RUN npm run build

# Stage 2: Web Server (Nginx)
# This container will ONLY serve the static frontend
FROM nginx:1.25-alpine

# Copy compiled files from previous stage
# Vite outputs to 'dist' by default
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx configuration will be injected via volume or file
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
