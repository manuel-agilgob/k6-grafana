const fetch = require('node-fetch'); // asegúrate de tener node-fetch@2


const BASE_URL = 'http://localhost:8000';
const ENDPOINT = '/expedients_tracking/366/expedients_datatable?filters[court_id]=366&length=100';



const HEADERS = {
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'http://localhost:8000/expedients_tracking/366/expedients',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0', 
  'Cookie': 'XSRF-TOKEN=eyJpdiI6IitSSVpUVlpRR2l3aW94NVwvUWg2eEtRPT0iLCJ2YWx1ZSI6InlpbVhHMzF2Mlord0ZlV1pjRTRTdlEwaU1UVXVHend1dkJydyt6WldPRDl0VFl5OGtQQlRCcnZIdE5lMVNkU3QiLCJtYWMiOiIzMzkxZmU1NTg1MGM2YzllNTA4ODgwNGNkOThjNTg5ZjE1NDlmMDUxZjRjNzM4N2MyYzI1NjEwNTIyYTEzMzk3In0%3D; gpm_v20_session=eyJpdiI6IkdEbnBHVlp3cHhuWDlHbzBnQk9iYmc9PSIsInZhbHVlIjoiR1wvcUV4YzNZWTdvR1wvN1VwRUVnUHhnSlRIMXVUYUtNRTZRQ1RZYlwvcGZyaVpvQVB2Rmg1VERYdU5iNytrdVdWUCIsIm1hYyI6ImEwMjlhYzc5MDRhZjE4NzU4MzE3Mzg4NGMwMzg4MjkxOTAzYzZjODBhMWNiNGUyN2RmNDM4NDFmNTJlNjMzOGMifQ%3D%3D'
};

(async () => {
  const start = Date.now();

  try {
    const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'GET',
      headers: HEADERS
    });

    const duration = Date.now() - start;
    const buffer = await res.clone().arrayBuffer();
    const data = await res.json();

    const now = new Date();
    const formattedTime = now.toLocaleString('es-ES');

    console.log(`time:${formattedTime};duration:${duration}ms;status:${res.status};bytes:${buffer.byteLength}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();


