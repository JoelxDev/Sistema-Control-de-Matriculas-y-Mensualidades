export const API_BASE = 'http://localhost:3000';

export function fetchAuth(url, options = {}) {
  return fetch(url.startsWith('http') ? url : API_BASE + url, {
    ...options,
    credentials: 'include'
  }).then(async res => {
    if (res.status === 401) {
      return Promise.reject(new Error('No autenticado'));
    }
    return res;
  });
}

export function requireSession() {
  return fetchAuth('/api/auth/verify')
    .catch(() => { window.location.href = 'http://localhost:8088/'; });
}

export function logout() {
  return fetchAuth('/api/auth/logout', { method: 'POST' })
    .finally(() => { window.location.href = 'http://localhost:8088/'; });
}