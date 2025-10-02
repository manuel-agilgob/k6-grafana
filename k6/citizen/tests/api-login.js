import http from 'k6/http';
import { check } from 'k6';

import { testLogin } from '../services/citizen.js';
import { loadOptions, loadTestData } from '../../utilities/setup.js';




const testStrategy = __ENV.STRATEGY || 'smoke';
const environment = __ENV.ENVIRONMENT || 'sandbox';
const application = __ENV.APPLICATION || 'citizen';


export const options = loadOptions(testStrategy, environment, application);
export const data = loadTestData(environment, 2, application); 

const authorization = data.appData.authorization;
const users = data.users;
const baseUrl = data.appData.apiBaseUrl;


const headersBase = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Authorization": authorization,
};


export default function () {

    const user = users[__VU - 1];
    // const user = users[__VU % users.length];

    const jwt = testLogin(baseUrl, headersBase, user);

    if(!jwt) {
        // console.error('LOGIN NOK: ' + user.email);
        return;
    }else {
        // console.log('LOGIN OK: ' + user.email);
        // testExpedients(baseUrl, headersBase, jwt);
        // testPushNotifications(baseUrl, headersBase, jwt);
        // testPendingSignatures(baseUrl, headersBase, jwt);
    }
}