FROM grafana/k6:latest

# Copia todos los archivos y carpetas al contenedor
COPY . ./app

WORKDIR /app