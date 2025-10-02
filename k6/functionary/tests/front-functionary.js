import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';
import exec from 'k6/execution';

import { testLogin} from '../services/functionary.js';
import { loadOptions, loadTestData } from '../../utilities/setup.js';




const testStrategy = __ENV.STRATEGY || 'smoke';
const environment = __ENV.ENVIRONMENT || 'sandbox';
const application = __ENV.APPLICATION || 'functionary';

console.log(application )
console.log(environment )
console.log(testStrategy )

export const options = loadOptions(testStrategy, environment, application);
export const data = loadTestData(environment, 3, application); 

const authorization = data.appData.authorization;
const users = data.users;
const baseUrl = data.appData.apiBaseUrl;


const headersBase = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Authorization": authorization,
};




// Variable compartida entre VUs para almacenar los JWT
const vuJwts = new Map();

export default function () {
    const vuId = __VU - 1;




    // Inicializar JWT solo una vez por VU
    let user = users[vuId];
    
    if (!vuJwts.has(vuId)) {
        const loginInfo = testLogin(baseUrl, headersBase, user);
        user = {...user, ...loginInfo};
        vuJwts.set(vuId, user);
        // console.log(`[VU ${__VU}] Initial login for user ${user.email}`);
    } else {
        user = vuJwts.get(vuId);
        // console.log(`[VU ${__VU}] Reusing login for user ${user.email} (iteration ${exec.vu.iterationInInstance})`);
    }


    // sleep(2);
    // Expedientes electronicos por usuario
    const expedientsUserHeaders = { ...headersBase, Authorization: user.jwt };
    const expedientsUserRes = http.get(
        `${baseUrl}/api/v1/electronic_expedients/find/user/${user.id}/1/10?page=1`,
        { headers: expedientsUserHeaders }
    );

    check(expedientsUserRes, {
        'expedientes por usuario 200': (r) => r.status === 200,
        'hay data en expedientes por usuario': (r) => r.json('data') !== undefined,
    });


    // sleep(2);
    // Expedientes electronicos por juzgado
    const expedientsCourtHeaders = { ...headersBase, Authorization: user.jwt };
    const expedientsCourtRes = http.get(
        `${baseUrl}/api/v1/electronic_expedients/find_by_court/10?page=1`,
        { headers: expedientsCourtHeaders }
    );

    check(expedientsCourtRes, {
        'expedientes por juzgado 200': (r) => r.status === 200,
        'hay data en expedientes por juzgado': (r) => r.json('data') !== undefined,
    });

    
    // sleep(1);
    // Documentos pendientes de firma por usuario
    // const pendingSignaturesHeaders = { ...headersBase, Authorization: user.jwt };
    // const pendingSignaturesRes = http.get(
    //     `${baseUrl}/api/v1/signature_documents/get_documents_pending_signature_by_user/10`,
    //     { headers: pendingSignaturesHeaders }
    // );
    // check(pendingSignaturesRes, {
    //     'pendientes de firma 200': (r) => r.status === 200,
    //     'hay data en pendientes de firma': (r) => r.json('data') !== undefined,
    //     'hay documentos pendientes de firma': (r) => r.json('data.signatureDocuments')   
    //  });


    // sleep(2);
    // Notificaciones push
    const pushNotificationsHeaders = { ...headersBase, Authorization: user.jwt };
    const pushNotificationsRes = http.get(
        `${baseUrl}/api/v1/push_notifications/20?page=1`,
        { headers: pushNotificationsHeaders }
    );

    check(pushNotificationsRes, {
        'notificaciones push 200': (r) => r.status === 200,
        'contiene objeto notificaciones': (r) => r.json('data.notifications') !== undefined,
    });


    console.log(`Completed iteration ${exec.vu.iterationInInstance} for user ${user.email}`)     //en qué iteración nos encontramos para verificar
}