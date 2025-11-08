// Backend corre en 3000; login (UI) en 8088
export const API_BASE = `http://${location.hostname}:3000`;

export function fetchAuth(url, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = 'Bearer ' + token;
  return fetch(url.startsWith('http') ? url : API_BASE + url, { ...options, headers })
    .then(async res => {
      if (res.status === 401) {
        logout();
        return Promise.reject(new Error('No autenticado'));
      }
      return res;
    });
}

export function requireSession() {
  const t = localStorage.getItem('auth_token');
  if (!t) window.location.href = `http://${location.hostname}:8088/`;
}

export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.location.href = `http://${location.hostname}:8088/`;
}