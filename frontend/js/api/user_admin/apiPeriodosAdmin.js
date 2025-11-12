import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/periodos')) {
    fetchAuth('/api/periodos')
      .then(res => res.json())
      .then(periodos => {
        const tbody = document.getElementById('periodos-list');
        tbody.innerHTML = '';
        periodos.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${p.id_periodo}</td>
            <td>${p.nombre_per}</td>
            <td>${p.fecha_inicio_per.split('T')[0]}</td>
            <td>${p.fecha_fin_per.split('T')[0]}</td>
            <td>${p.anio_acad}</td>
            <td>
              <a href="/admin/periodos/editar?id=${p.id_periodo}"><button>Editar</button></a>
              <button class="btn-eliminar" data-id="${p.id_periodo}">Eliminar</button>
            </td>
            
          `;
          tbody.appendChild(tr);
        });

         document.querySelectorAll('.btn-eliminar').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (!id) return;
            if (!confirm('¿Seguro que deseas eliminar este periodo?')) return;
            try {
              const resp = await fetchAuth(`/api/periodos/${encodeURIComponent(id)}`, { method: 'DELETE' });
              const text = await resp.text(); // puede no ser JSON
              if (!resp.ok) throw new Error(text || 'Error al eliminar');
              alert('Periodo eliminado');
              location.reload();
            } catch (err) {
              console.error('Eliminar periodo:', err);
              alert('Error al eliminar (ver consola)');
            }
          });
        });

      });
  }
});
document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/periodos/crear')) {
    // Cargar años académicos para el select
    fetchAuth('/api/anio_academico')
      .then(res => res.json())
      .then(anios => {
        const select = document.getElementById('anio_academico_id_anio_escolar');
        anios.forEach(a => {
          select.innerHTML += `<option value="${a.id_anio_escolar}">${a.anio_acad}</option>`;
        });
      });

    const form = document.getElementById('form-crear-periodo');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = {
        nombre_per: form.nombre_per.value,
        fecha_inicio_per: form.fecha_inicio_per.value,
        fecha_fin_per: form.fecha_fin_per.value,
        estado_per: form.estado_per.value,
        anio_academico_id_anio_escolar: form.anio_academico_id_anio_escolar.value
      };
      fetchAuth('/api/periodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.id) {
            alert('Periodo creado');
            window.location.href = '/secretario/periodos';
          } else {
            alert(result.error || 'Error al crear');
          }
        });
    });
  }
});
document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/periodos/editar')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const form = document.getElementById('form-editar-periodo');
    // Cargar años académicos para el select
    fetchAuth('/api/anio_academico')
      .then(res => res.json())
      .then(anios => {
        const select = document.getElementById('anio_academico_id_anio_escolar');
        anios.forEach(a => {
          select.innerHTML += `<option value="${a.id_anio_escolar}">${a.anio_acad}</option>`;
        });
        // Cargar datos actuales del periodo
        fetchAuth(`/api/periodos/${id}`)
          .then(res => res.json())
          .then(periodo => {
            form.nombre_per.value = periodo.nombre_per;
            form.fecha_inicio_per.value = periodo.fecha_inicio_per.split('T')[0];
            form.fecha_fin_per.value = periodo.fecha_fin_per.split('T')[0];
            form.estado_per.value = periodo.estado_per;
            form.anio_academico_id_anio_escolar.value = periodo.anio_academico_id_anio_escolar;
          });
      });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = {
        nombre_per: form.nombre_per.value,
        fecha_inicio_per: form.fecha_inicio_per.value,
        fecha_fin_per: form.fecha_fin_per.value,
        estado_per: form.estado_per.value,
        anio_academico_id_anio_escolar: form.anio_academico_id_anio_escolar.value
      };
      fetchAuth(`/api/periodos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.message) {
            alert('Periodo actualizado');
            window.location.href = '/secretario/periodos';
          } else {
            alert(result.error || 'Error al actualizar');
          }
        });
    });
  }
});