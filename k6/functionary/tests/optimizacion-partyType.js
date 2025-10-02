import http from 'k6/http';
import { check } from 'k6';

import { testLogin, testGetPartyType} from '../services/functionary.js';
import { loadOptions, loadTestData } from '../../utilities/setup.js';




const testStrategy = __ENV.STRATEGY || 'smoke';
const environment = __ENV.ENVIRONMENT || 'sandbox';
const application = __ENV.APPLICATION || 'functionary';


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




export default function () {

    const user = users[__VU - 1];
    if( !user.jwt){
        user.jwt = testLogin(baseUrl, headersBase, user);
    }

    
    // testGetJudgementTypes(baseUrl, headersBase, user.jwt);
    const res = testGetPartyType(baseUrl, headersBase, user.jwt);
    if(!res){
        console.error(`Error in testGetPartyType for user ${user.email}`);
    }else{
        console.log(`testGetPartyType for user ${user.email} passed`);
    }

}