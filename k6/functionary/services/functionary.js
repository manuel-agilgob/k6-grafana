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
    
    return {
        jwt: loginRes.json('data.jwt'),
        id: loginRes.json('data.user.id'),
    }
}


export const testExpedients = (baseUrl, headersBase, jwt) => {

    const expedientsHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const expedientsRes = http.get(
        `${baseUrl}/api/v1/electronic_expedients/find_by_court/10?page=1`,
        { headers: expedientsHeaders }
    );

    check(expedientsRes, {
        'expedientes 200': (r) => r.status === 200,
        'hay data': (r) => r.json('data') !== undefined,
    });

}


export const testPushNotifications = (baseUrl, headersBase, jwt) => {

    const pushNotificationsHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const pushNotificationsRes = http.get(
        `${baseUrl}/api/v1/push_notifications/20?page=1`,
        { headers: pushNotificationsHeaders }
    );

    check(pushNotificationsRes, {
        'notificaciones push 200': (r) => r.status === 200,
        'contiene objeto notificaciones': (r) => r.json('data.notifications') !== undefined,
    });
    return pushNotificationsRes.json('code');

}

export const testPendingSignatures = (baseUrl, headersBase, jwt) => {
   
    const pendingSignaturesHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const pendingSignaturesRes = http.get(
        `${baseUrl}/api/v1/signature_documents/get_documents_pending_signature_by_user/10`,
        { headers: pendingSignaturesHeaders }
    );

    check(pendingSignaturesRes, {
        'pendientes de firma 200': (r) => r.status === 200,
    });

    return pendingSignaturesRes.json('code');
}

export const testGetMatters = (baseUrl, headersBase, jwt) => {
    const mattersHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const mattersRes = http.get(
        `${baseUrl}/api/v1/matters/get_list`,
        { headers: mattersHeaders }
    );

    check(mattersRes, {
        'materias 200': (r) => r.status === 200,
        'materias status true ': (r) => r.json('status') === true,
        'hay data': (r) => r.json('data') !== undefined,
    });

    return mattersRes.json('status');
}

export const testGetJudgementTypes = (baseUrl, headersBase, jwt) => {
    const judgementsHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const judgementRes = http.get(
        `${baseUrl}/api/v1/government_books/catalogs/judgement_types`,
        { headers: judgementsHeaders }
    );

    check(judgementRes, {
        'materias 200': (r) => r.status === 200,
        'materias status true ': (r) => r.json('status') === true,
        'contiene judgementTypes': (r) => r.json('data.judgementTypes') !== undefined,
    });

    return judgementRes.json('status');
}

export const testGetLegalWays = (baseUrl, headersBase, jwt) => {
    const legalWaysHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const legalWaysRes = http.get(
        `${baseUrl}/api/v1/government_books/catalogs/legal_ways`,
        { headers: legalWaysHeaders }
    );

    check(legalWaysRes, {
        'materias 200': (r) => r.status === 200,
        'materias status true ': (r) => r.json('status') === true,
        'contiene legalWays': (r) => r.json('data.legalWays') !== undefined,
    });

    return legalWaysRes.json('status');

}

export const testGetDependences = (baseUrl, headersBase, jwt) => {
    const dependencesHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const dependencesRes = http.get(
        `${baseUrl}/api/v1/government_books/catalogs/dependences`,
        { headers: dependencesHeaders }
    );

    check(dependencesRes, {
        'materias 200': (r) => r.status === 200,
        'materias status true ': (r) => r.json('status') === true,
        'contiene dependences': (r) => r.json('data.dependences') !== undefined,
    });

    return dependencesRes.json('status');

}

export const testGetPartyType = (baseUrl, headersBase, jwt) => {
    const partyTypesHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const partyTypesRes = http.get(
        `${baseUrl}/api/v1/partyType/get_all`,
        { headers: partyTypesHeaders }
    );

    check(partyTypesRes, {
        'materias 200': (r) => r.status === 200,
        'materias status true ': (r) => r.json('status') === true,
        'contiene dependences': (r) => r.json('data.partyTypes') !== undefined,
    });

    return partyTypesRes.json('code');

}

export const testCrimes = (baseUrl, headersBase, jwt, matter="familiar") => {
    const crimesHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const crimesRes = http.get(
        `${baseUrl}/api/v1/electronic_expedient/crimes/${matter}`,
        { headers: crimesHeaders }
    );

    check(crimesRes, {
        'materias 200': (r) => r.status === 200,
        'materias status true ': (r) => r.json('status') === true,
        'contiene datos de delitos': (r) => r.json('data') !== undefined,
    });

    return crimesRes.json('code');;

}

export const testRubros = (baseUrl, headersBase, jwt) => {
    const rubrosHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const rubrosRes = http.get(
        `${baseUrl}/api/v1/catalogs/headings`,
        { headers: rubrosHeaders }
    );

    check(rubrosRes, {
        'materias 200': (r) => r.status === 200,
        'materias status true ': (r) => r.json('status') === true,
        'contiene datos de rubros': (r) => r.json('data.headings') !== undefined,
        'hay más de un rubro': (r) => Array.isArray(r.json('data.headings')) && r.json('data.headings').length > 1,
    });

    return rubrosRes.json('code');;

}

export const testElectronicExpedientsByCourt = (baseUrl, headersBase, jwt) => {
    const expedientsHeaders = {
        ...headersBase,
        Authorization: jwt,
    };

    const expedientsRes = http.get(
        `${baseUrl}/api/v1/electronic_expedients/find_by_court/10?page=1`,
        { headers: expedientsHeaders }
    );  

    check(expedientsRes, {
        'expedientes 200': (r) => r.status === 200,
        'hay data': (r) => r.json('data') !== undefined,
    });

    return expedientsRes.json('code');
}


export const testElectronicExpedientsByUser = (baseUrl, headersBase, user) => {
    const expedientsHeaders = {
        ...headersBase,
        Authorization: user.jwt
    };
    const expedientsRes = http.get(
        `${baseUrl}/api/v1/electronic_expedients/find/user/${user.id}/1/10?page=1`,
        { headers: expedientsHeaders }
    );

    check(expedientsRes, {
        'expedientes 200': (r) => r.status === 200,
        'hay data': (r) => r.json('data') !== undefined,
    });

    return expedientsRes.json('code');;
    
}
