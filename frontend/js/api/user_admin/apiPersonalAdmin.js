// import { requireSession, fetchAuth  } from '../../../public/js/auth.js';
// import { fetchAuth } from '/js/auth.js';
import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname === '/admin/personal_administrativo') {
        fetchAuth('/api/admin/usuarios/personal')
            .then(r => r.json())
            .then(result => {
                const tbody = document.querySelector('.tabla-detalles tbody');
                tbody.innerHTML = '';
                (result.data || []).forEach(item => {
                    const nombreCompleto = `${item.nombre_per} ${item.apellido}`;
                    const username = item.usuario ? item.usuario.nombre_usuario : '';
                    const cargo_per = item.cargo_per ?? item.usuario?.roll ?? '';
                    const correo_elec_per = item.correo_elec_per ?? item.usuario?.correo_elec_per ?? '';
                    const estado = item.estado_per ?? item.usuario?.estado_us ?? '';
                    const dni = item.dni ?? '';
                    const telefono = item.telefono_per ?? '';
                    const fecha_creacion = item.fecha_creacion_per ? item.fecha_creacion_per.split('T')[0] : '';
                    const editId = item.personal_id;

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
            <td>${nombreCompleto}</td>
            <td>${username}</td>
            <td>${cargo_per}</td>
            <td>${dni}</td>
            <td>${telefono}</td>
            <td>${correo_elec_per}</td>
            <td>${estado}</td>
            <td>${fecha_creacion}</td>
            <td>
              <a class="link-editar" data-id="${editId}" href="/admin/personal_administrativo/editar?id=${encodeURIComponent(editId)}"><button>Editar</button></a>
              <button data-id="${item.personal_id}" class="btn-eliminar">Eliminar</button>
            </td>`;
                    tbody.appendChild(tr);
                    tr.querySelector('.link-editar')?.addEventListener('click', (e) => {
                      const pid = e.currentTarget.getAttribute('data-id');
                      if (pid) sessionStorage.setItem('personal_edit_id', pid);
                    });
                });

                document.querySelectorAll('.btn-eliminar').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const id = this.getAttribute('data-id');
                        if (confirm('¿Seguro que deseas eliminar este personal?')) {
                            fetchAuth(`/api/admin/usuarios/usuarios-personal/${id}`, { method: 'DELETE' })
                              .then(async res => { if (!res.ok) throw new Error(await res.text()); return res.json().catch(()=>({})); })
                              .then(() => location.reload())
                              .catch(err => { console.error(err); alert('Error al eliminar'); });
                        }
                    });
                });
            });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-crear-personal');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const fd = new FormData(form);
        const d = {}; fd.forEach((v,k)=>d[k]=v);

        // Normalizar a columnas nuevas
        const payload = {
          nombre_per: d.nombre_per ?? d.nombre ?? '',
          apellido: d.apellido ?? '',
          cargo_per: d.cargo_per ?? d.cargo ?? '',
          dni: d.dni ?? '',
          telefono_per: d.telefono_per ?? d.telefono ?? '',
          correo_elec_per: d.correo_elec_per ?? d.correo ?? d.email ?? '',
          estado_per: d.estado_per ?? d.estado ?? 'activo'
        };

        // Generar usuario inicial
        const primerNombre = (payload.nombre_per.split(' ')[0] || '').toLowerCase();
        const primerApellido = (payload.apellido.split(' ')[0] || '').toLowerCase();
        payload.nombre_usuario = d.nombre_usuario ?? (primerNombre + primerApellido);
        payload.contrasenia = d.contrasenia ?? payload.dni;

        const cargoLow = String(payload.cargo_per).toLowerCase();
        payload.roll = cargoLow.includes('admin') ? 'administrador'
                     : cargoLow.includes('secretaria') ? 'secretaria'
                     : 'otro';

        fetchAuth('/api/admin/usuarios/usuarios', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(resp => {
          if (resp.message) {
            alert('¡Personal y usuario creados!');
            window.location.href = '/admin/personal_administrativo';
          } else {
            alert('Error al crear');
          }
        })
        .catch(()=>alert('Error al conectar'));
    });
});

document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('form-editar-personal');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  let id = params.get('id') || sessionStorage.getItem('personal_edit_id') || (window.location.pathname.match(/\/editar\/(\d+)/)?.[1] ?? null);
  if (!id) { alert('ID no encontrado'); return; }

  const setVal = (name, value) => { const el = form.querySelector(`[name="${name}"], #${name}`); if (el) el.value = value ?? ''; };
  const getVal = (name) => (form.querySelector(`[name="${name}"], #${name}`)?.value ?? '').trim();

  const res = await fetch(`/api/admin/usuarios/personal/${encodeURIComponent(id)}`);
  if (!res.ok) { alert('No se pudo cargar'); return; }
  const data = await res.json();

  setVal('nombre_per', data.nombre_per);
  setVal('apellido', data.apellido);
  setVal('cargo_per', data.cargo_per);
  setVal('dni', data.dni);
  setVal('telefono_per', data.telefono_per);
  setVal('correo_elec_per', data.correo_elec_per);
  setVal('estado_per', data.estado_per);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const body = {
      nombre_per: getVal('nombre_per'),
      apellido: getVal('apellido'),
      cargo_per: getVal('cargo_per'),
      dni: getVal('dni'),
      telefono_per: getVal('telefono_per'),
      correo_elec_per: getVal('correo_elec_per'),
      estado_per: getVal('estado_us')
    };

    fetchAuth(`/api/admin/usuarios/usuarios-personal/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    })
    .then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json().catch(()=>({})); })
    .then(() => { sessionStorage.removeItem('personal_edit_id'); alert('¡Datos actualizados!'); window.location.href = '/admin/personal_administrativo'; })
    .catch(err => { console.error(err); alert('Error al actualizar'); });
  });
});