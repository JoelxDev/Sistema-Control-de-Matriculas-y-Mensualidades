import { requireSession, fetchAuth, logout } from '/js/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  requireSession()
    .then(() => fetchAuth('/api/auth/me'))
    .then(r => r.json())
    .then(({ user }) => {
      if (!user) return;
      const map = {
        'perfil-id': `ID: ${user.sub || '-'}`,
        'perfil-nombre': `${user.nombre_per || '-'} ${user.apellido || ''}`.trim(),
        'perfil-telefono': `Telefono: ${user.telefono_per || '-'}`,
        'perfil-username': `Nombre de usuario: ${user.username || '-'}`
      };
    //   const title = document.querySelector('.title-menu h3');
    //   if (title) title.textContent = `USUARIO: ${user.username}`;
      Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      });
      if (user.role) {
        const rolEl = document.getElementById('perfil-rol');
        if (rolEl) rolEl.textContent = `Rol: ${user.role.replace(/_/g,' ')}`;
      }
    })
    .catch(err => console.warn('Perfil error:', err));

  document.getElementById('btn-logout')?.addEventListener('click', e => {
    e.preventDefault();
    logout();
  });
});