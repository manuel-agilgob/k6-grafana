import http from 'k6/http';
import { check } from 'k6';

import { testLoginFront } from '../services/citizen.js';
import { loadOptions, loadTestData } from '../../utilities/setup.js';




const testStrategy = __ENV.STRATEGY || 'smoke';
const environment = __ENV.ENVIRONMENT || 'sandbox';
const application = __ENV.APPLICATION || 'citizen';


export const options = loadOptions(testStrategy, environment, application);
export const data = loadTestData(environment, 2, application); 

const authorization = data.appData.authorization;



// const headersBase = {
//     "Content-Type": "application/json",
//     "Accept": "application/json, text/plain, */*",
//     "Authorization": authorization,
// };


export default function () {

    testLoginFront(data.appData.url);

}