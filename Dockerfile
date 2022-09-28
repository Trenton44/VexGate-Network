FROM amazonlinux:latest
WORKDIR /app
COPY /fastify_backend .
COPY /react_frontend/build .




