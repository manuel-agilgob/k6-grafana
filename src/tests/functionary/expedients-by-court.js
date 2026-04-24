import { login } from '../../services/functionary_login.js';
import { http } from 'k6/http';
import { getExpedientsByUser } from '../../services/fun-expedients-by-user.js';
import { getExpedientsByCourt } from '../../services/fun-expedients-by-court.js';

const BASE_URL = __ENV.BASE_URL;
let ALL_USERS = JSON.parse(__ENV.USERS || '[]');



export const options = {
  stages: [
    { duration: '15m', target: 75 },
  ],
};



export function setup() {
  if (ALL_USERS.length === 0) {
    throw new Error('No se han proporcionado usuarios en la variable de entorno USERS');
  }
  
  for (let i = 0; i < ALL_USERS.length; i++) {
    let jwt = login(BASE_URL, ALL_USERS[i].email, ALL_USERS[i].password);
    ALL_USERS[i].jwt = jwt.json().data.jwt;
    ALL_USERS[i].id = jwt.json().data.user.id;
  }
  return ALL_USERS;
}

export default function(ALL_USERS) {
  __VU = __VU % ALL_USERS.length; // Asignar un usuario a cada VU de forma cíclica
  const user = ALL_USERS[__VU];

  getExpedientsByUser(BASE_URL, user.jwt, user.id );
  getExpedientsByCourt(BASE_URL, user.jwt, user.id );

}


