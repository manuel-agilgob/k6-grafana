# Descripcion

El proyecto emplea solamente k6 para probar con N cantidad de ciudadanos, funcioarios o administradores

Para ciudadanos y funcionarios, dependiendo el tipo de prueba, se emplean difernetes cuentas, para las cuales se generan multiples JWT.
Para las pruebas de administradores se usa un solo administrador, generando primero las cookies de acceso. 

## Credenciales 
Las credenciales son guardadas en el repositrio, haciendo uso de dotenvx, si necesitas usar este proyecto, puedes :
- Generar tus credenciales, usando las claves de los .env del repositorio
- Solicitar la clave privada `.env.keys` para poder ejecutar con las credenciales existentes en el repositorio 


``` bash
npx dotenvx run -f .env.local -- k6 run <ruta al script>
```

## Frameworks 
Si te interesa conocer mas de las herramientas empleadas en proyecto, consulta las siguientes paginas de documentacion: 
- [k6](https://grafana.com/docs/k6/latest/)
- [dotenvx](https://dotenvx.com/)
