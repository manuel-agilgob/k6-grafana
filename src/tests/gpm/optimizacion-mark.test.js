import { getCSRF } from "../../services/gpm-get-csrf.js";
import { login } from "../../services/gpm-login.js";

const STRATEGY = __ENV.STRATEGY;
const ENVIRONMENT = __ENV.ENVIRONMENT || 'sandbox';

export function setup() {
    // GET y POST deben ocurrir en el mismo VU para que k6 lleve la cookie de sesión
    const token = getCSRF();
    if (!token) {
        console.error("No se pudo obtener el token CSRF");
        return;
    }

    const res = login(
        __ENV.GPM_USERNAME,
        __ENV.GPM_PASSWORD,
        token,
        __ENV.GPM_BASE_URL
    );

    if( res.status !== 200) {
        console.error("Login fallido:", res.status, res.statusText);
        return;
    }
    const headers = res.headers

    return { headers }

}

export default function ( headers ) {
    console.log( headers )
}

export function teardown() {}