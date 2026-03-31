import http from "k6/http";

export function login(username, password, csrfToken, baseUrl) {
  const res = http.post(
    baseUrl + '/login',
    `user=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&_token=${encodeURIComponent(csrfToken)}`,
    { headers:{ 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    }
  );

  return res;
}
