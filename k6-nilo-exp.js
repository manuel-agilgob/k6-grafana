import http from 'k6/http';
import { check } from 'k6';


const BASE_URL = 'https://sandbox.nilo.cjj.gob.mx';
// const BASE_URL = 'http://35.89.118.80'
const ENDPOINT = '/expedients_tracking/24/expedients_datatable?filters[court_id]=24&length=100';

const XSRF_TOKEN = 'eyJpdiI6IkZrdjJjZEhiM3hqUkFkNUJSYmJTcWc9PSIsInZhbHVlIjoiNzl0eDNhNjRrQmRPTXJlT3hLSXpWeDZ2ZVZPN0dyS2JtVkpwOHF6NGM3QkpcL0o3elQ3QlNDNlJSK1wvTVZjOEtLIiwibWFjIjoiM2ExYTQ3ZWM3ZWNhMTQ2YjkwN2VkYmE4ZjlmNzk0MWViZmYzMGQzZDU3NGJiMDk0Mzk4YmI5MjE1NmUwODEwZSJ9';
const gpm_v20_session = 'eyJpdiI6IjllYVpQRVlGUFpZaHFYNzNtV1llNkE9PSIsInZhbHVlIjoieitpY0l5WGY1eCtlK0lnWkx0cERjdktEb00zUEw3VFE4OXorVVE0MExGcFVQU0NZbTFZcDhlOE1cL1hmSDhtN1YiLCJtYWMiOiJmZTlkYWJmOTZhNGFlMDkyOWQ1NjVlYWQxM2I2MTRjNTNhZTFlYWM2YWU0ZGY3ODNlOTlmYTMyNmZjZjUwZTM1In0%3D';

const HEADERS = {
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'http://localhost:8000/expedients_tracking/366/expedients',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
  'Cookie': `XSRF-TOKEN=${XSRF_TOKEN}; gpm_v20_session=${gpm_v20_session}`,
};



export const options = {
    stages: [
        { duration: '2m', target: 100 }, 
        { duration: '30s', target: 100 }, 
        { duration: '2m', target: 0 },   
    ],
};


export default function () {
  const start = Date.now();
  const res = http.get(`${BASE_URL}${ENDPOINT}`, { headers: HEADERS });
  const duration = Date.now() - start;

  const bytes = res.body ? res.body.length : 0;
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];

  console.log(`time:${now}; duration:${duration}ms; status:${res.status}; bytes:${bytes}`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
