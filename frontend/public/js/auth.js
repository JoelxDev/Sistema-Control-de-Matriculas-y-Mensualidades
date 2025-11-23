export const API_BASE = 'http://localhost:3000';

export function fetchAuth(url, options = {}) {
  return fetch(url.startsWith('http') ? url : url, {
    ...options,
    credentials: 'include'
  }).then(res => {
    if (res.status === 401) throw new Error('UNAUTH');
    return res;
  });
}

export function requireSession() {
  return fetchAuth('/api/auth/verify')
    .catch(err => {
      if (err.message === 'UNAUTH') {
        window.location.href = 'http://localhost:8088/?error=no_auth';
      }
    });
}

// Agregar esta función
export function logout() {
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  }).finally(() => {
    window.location.href = 'http://localhost:8088/';
  });
}
// ...existing code...