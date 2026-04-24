
import http from 'k6/http';



export function login(baseUrl, email, password){

    // console.log(`Iniciando sesión para ${email}`);
    // console.log(`URL de login: ${baseUrl}api/v1/auth/sign_in`);
    // console.log(`Password: ${password}`);

    let url = `${baseUrl}/api/v1/auth/sign_in`;
    return http.post(url, JSON.stringify({
        "email": email,
        "password": password,
        "app_id":3
    }), {
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7",
            "Authorization": "YWxwaGEx",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0"
        }
    });
    

}



const headers = [
    {
        "name": "Accept",
        "value": "application/json, text/plain, */*"
    },
    {
        "name": "Accept-Encoding",
        "value": "gzip, deflate, br, zstd"
    },
    {
        "name": "Accept-Language",
        "value": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    {
        "name": "Authorization",
        "value": "YWxwaGEx"
    },
    {
        "name": "Connection",
        "value": "keep-alive"
    },
    {
        "name": "Content-Length",
        "value": "63"
    },
    {
        "name": "Content-Type",
        "value": "application/json"
    },
    {
        "name": "Host",
        "value": "nilo.cjj.gob.mx"
    },
    {
        "name": "Origin",
        "value": "https://funcionario.cjj.gob.mx"
    },
    {
        "name": "Referer",
        "value": "https://funcionario.cjj.gob.mx/"
    },
    {
        "name": "Sec-Fetch-Dest",
        "value": "empty"
    },
    {
        "name": "Sec-Fetch-Mode",
        "value": "cors"
    },
    {
        "name": "Sec-Fetch-Site",
        "value": "same-site"
    },
    {
        "name": "User-Agent",
        "value": "Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0"
    }
]
