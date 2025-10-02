import http from 'k6/http';
import { check } from 'k6';

export const testLogin = (baseUrl, headersBase, user) => {
    const loginPayload = JSON.stringify(user);

    const loginRes = http.post(`${baseUrl}/api/v1/auth/sign_in`, loginPayload, {
        headers: headersBase,
    });

    check(loginRes, {
        'login 200': (r) => r.status === 200,
        'jwt presente': (r) => r.json('data.jwt') !== undefined,
    });
    const jwt = loginRes.json('data.jwt');
    return jwt;
}

export const testLoginFront = (url) => {
    const headers = {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0'
    };
    const response = http.get(url, {headers});
    check( response, {
        'login HTML 200': (r) => r.status === 200,
        'es HTML (SPA root)': (r) => r.body.includes('<div id="root"')
    });

}