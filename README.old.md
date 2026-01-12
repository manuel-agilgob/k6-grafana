export $(grep -v '^#' .env.sandbox | xargs)


## Estructura del proyecto 
Esta estructura es totalente independiente del proyecto de Cypress y Playwrigt y puede ejecutarse sin la instalacion de estos otros marcos de trabajo.

Carpeta data :
Contiene dos grupos de datos : 
- data 
  - configs : Contiene los tipos de prueba que se importan en el plan de pruebas, permitiendo modificar la duración y la carga aplicada. Para más detalles sobre los tipos de prueba, consulta el documento [configs](./data/configs/README.md).
  - users.<app>.json : Contiene las credenciales que se utilizan para crear los usuarios virtuales (vus) durante las pruebas. Este archivo es confidencial, no debe subirse al repositorio y debe estar incluido en `.gitignore`. 


Para cada aplicacion (citizen / functionary) se tiene la siguiente estructura :
- aplicacion
  - services : funciones que llaman a las apis o paginas, incluyen validaciones 
  - tests : importa las funciones de services para armar flujos mas complejos, ademas importa configuraciones de la carpeta data para configurar la forma en que se ejecutan las pruebas como cantidad de usuarios virtuales (vus) o etapas (stages) asi como la duracion de estas, para cambiar el tipo de prueba que se lleva a cabo. 

  ### Cómo ejecutar el proyecto

  Para establecer variables de entorno al ejecutar los comandos, antepón la variable al comando. Por ejemplo, puedes definir la variable `K6_WEB_DASHBOARD` para habilitar el dashboard web de K6:

  ```shell
  K6_WEB_DASHBOARD=true k6 run k6/functionary/tests/front-functionary.js
  ```

  Algunas variables de entorno que puedes utilizar son:

  - `K6_WEB_DASHBOARD`: Habilita el dashboard web de K6.
  - `K6_WEB_DASHBOARD_EXPORT`: Ruta donde se exporta el reporte HTML.


  - `STRATEGY`: Define la estrategia de prueba a utilizar (`smoke` por defecto).
    ```js
    const testStrategy = __ENV.STRATEGY || 'smoke';
    ```
  - `ENVIRONMENT`: Especifica el entorno de pruebas (`sandbox` por defecto).
    ```js
    const environment = __ENV.ENVIRONMENT || 'sandbox';
    ```
  - `APPLICATION`: Indica la aplicación sobre la que se ejecutan las pruebas (`functionary` por defecto).
    ```js
    const application = __ENV.APPLICATION || 'functionary';
    ```

```
# Ejemplo de ejecucion
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=tmp/Performance.html k6 run k6/functionary/tests/front-functionary.js
```





### Instalar K6 por fuera de node 
``` shell
sudo dnf install -y https://dl.k6.io/rpm/repo.rpm
sudo dnf install -y k6
```



### Correr las pruebas desde el contenedor de docker
``` shell
docker run -it \
  -v "$(pwd)/k6/users.sandbox.json:/home/k6/users.sandbox.json:z" \
  -v "$(pwd)/tmp:/home/tmp:z" \
  -e K6_WEB_DASHBOARD=true \
  -e K6_WEB_DASHBOARD_EXPORT=/home/tmp/k6-Report.html \
  cjj-testing-img \
  k6 run /home/k6/FUN_login.js --duration 2m
```



En docker compose para obtener el bucket de k6:
docker exec -it influxdb influx bucket list --name k6

# Crea auth v1 (usuario/clave que usará k6)
# Sustituye <BUCKET_ID> por el ID real del bucket k6
docker exec -it influxdb influx v1 auth create \
  --username k6-agil-gob \
  --password k6-agil-gob \
  --org agil \
  --read-bucket 8249f30987241c87 \
  --write-bucket 8249f30987241c87



## Ejecutar las pruebas de k6 en local 
```shell

export K6_INFLUXDB_USERNAME=k6-agil-gob
export K6_INFLUXDB_PASSWORD=k6-agil-gob
export K6_INFLUXDB_ADDR=http://influxdb:8086
export K6_INFLUXDB_DATABASE=k6 

export ENVIRONMENT=sandbox
export STRATEGY=average

export K6_WEB_DASHBOARD=true
export K6_WEB_DASHBOARD_EXPORT="Report_${ENVIRONMENT}_${STRATEGY}.html"

k6 run \
  --out influxdb=http://localhost:8086/k6 \
  --tag environment=$ENVIRONMENT \
  --tag strategy=$STRATEGY \
  k6/functionary/tests/front-functionary.js



```