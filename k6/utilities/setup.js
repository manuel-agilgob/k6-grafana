import { SharedArray } from 'k6/data';

/**
 * Carga la configuración de prueba (strategy) para un entorno y aplicación específica.
 *
 * Utiliza `SharedArray` para cargar desde un archivo JSON la estrategia de ejecución
 * (por ejemplo: smoke, stress, spike) y retorna las opciones correspondientes a la app y entorno seleccionados.
 *
 * @param {string} strategy - Nombre del archivo de configuración sin extensión. Ej: "smoke", "stress".
 * @param {string} environment - Entorno sobre el que se ejecuta la prueba. Ej: "sandbox", "production".
 * @param {string} application - Aplicación objetivo dentro del archivo de configuración. Ej: "functionary".
 * @returns {Object} - Objeto de configuración `options` compatible con `k6`.
 */
export const loadOptions = (strategy = "smoke", environment = "sandbox", application = "functionary") => {
    const rawStrategy = new SharedArray('strategy-data', () => [
        JSON.parse(open(`../../data/configs/${strategy}.json`))
    ])[0];

    const opts = JSON.parse(JSON.stringify(rawStrategy));
    const env = opts[environment]
    console.log(`Running ${strategy} test on ${environment} for ${application}`);
    console.log(rawStrategy);
    return env[application];
};


/**
 * Carga usuarios y datos de prueba específicos para una aplicación y entorno.
 *
 * Extrae desde el archivo de datos (users.[environment].json) los usuarios filtrados por `app_id`
 * y otros datos asociados a la aplicación (como headers, IDs, configuraciones específicas).
 *
 * @param {string} environment - Entorno del cual cargar el archivo de usuarios. Ej: "sandbox".
 * @param {number} app_id - Identificador de aplicación para filtrar usuarios.
 * @param {string} application - Clave del objeto de datos adicional por aplicación. Ej: "functionary".
 * @returns {{ appData: Object, users: Array<Object> }} - Un objeto que contiene:
 *   - `users`: Arreglo de usuarios filtrado por `app_id`.
 *   - `appData`: Objeto con datos adicionales para la aplicación especificada.
 */
export const loadTestData = (environment = "sandbox", app_id = 3, application = "functionary") => {
    const rawUsers = new SharedArray('users-data', () => [
        JSON.parse(open(`../../data/users.${environment}.json`))
    ])[0];

    const data = JSON.parse(JSON.stringify(rawUsers));
    const users = data.users.filter(user => user.app_id === app_id);
    const appData = data[application];

    return { appData, users };
};
