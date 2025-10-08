const fetch = require('node-fetch'); 

// LOCAL
// const baseUrl = "http://localhost:8000";
// const Authorization = "MTIzNDU2Nzg=";


// SANDBOX
// const baseUrl = "https://sandbox.nilo.cjj.gob.mx";
// const Authorization = "YWxwaGEx";


// OPTIMIZACION
const baseUrl = "http://35.89.118.80";
const Authorization = "YWxwaGEx";
// const Authorization = "MTIzNDU2Nzg=";



const headersBase = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Authorization": Authorization,

};



(async () => {
    const startTime = Date.now();

    const user = {
        email: 'laboral_oficialia@prueba.com',
        password: '12345678',
        app_id: 3,
    };

    const loginPayload = JSON.stringify(user);

    const response = await fetch(`${baseUrl}/api/v1/auth/sign_in`, {
        method: 'POST',
        headers: headersBase,
        body: loginPayload,
    });

    
    const buffer = await response.clone().arrayBuffer();
    const data = await response.json();
    console.log('JSON:', data);
    console.log('Byte Lenght:', buffer.byteLength);

    const endTime = Date.now();
    console.log(`Execution time: ${endTime - startTime} ms`);
})();
