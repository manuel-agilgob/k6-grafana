FROM grafana/k6:latest

# Copia todos los archivos y carpetas al contenedor
COPY ./k6 /app

WORKDIR /app