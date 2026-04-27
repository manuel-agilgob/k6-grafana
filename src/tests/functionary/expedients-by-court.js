import { login } from '../../services/functionary_login.js';
import { getExpedientsByUser } from '../../services/fun-expedients-by-user.js';
import { getExpedientsByCourt } from '../../services/fun-expedients-by-court.js';
import { sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL;
let ALL_USERS = JSON.parse(__ENV.USERS || '[]');

export const options = {
  stages: [
    { duration: '20m', target: 75 },
  ],
};

export function setup() {
  if (ALL_USERS.length === 0) {
    throw new Error('No se han proporcionado usuarios en la variable de entorno USERS');
  }

  const validUsers = [];

  for (let i = 0; i < ALL_USERS.length; i++) {
    const user = ALL_USERS[i];

    const response = login(BASE_URL, user.email, user.password);
    const data = response.json().data;

    if (!data?.user?.id) {
      console.error(`Error al iniciar sesión para ${user.email}: no se recibió ID`);
      continue;
    }

    user.jwt = data.jwt;
    user.id = data.user.id;

    validUsers.push(user);
  }
  return validUsers;
}

export default function (ALL_USERS) {
  const index = (__VU - 1) % ALL_USERS.length;
  const user = ALL_USERS[index];

  getExpedientsByUser(BASE_URL, user.jwt, user.id);
  sleep(1);
  getExpedientsByCourt(BASE_URL, user.jwt, user.id);
  // sleep(1);

}

