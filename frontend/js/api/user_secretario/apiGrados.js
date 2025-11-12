import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/aulas/grados')) {
        cargarGrados();

        // Delegación para eliminar
        document.body.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-eliminar-grado')) {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que deseas eliminar este grado?')) {
                    fetchAuth(`/api/grados/${id}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(result => {
                            if (result.message) cargarGrados();
                            else alert(result.error || 'Error al eliminar');
                        });
                }
            }
        });
    }
});

function cargarGrados() {
    fetchAuth('/api/grados')
        .then(res => res.json())
        .then(grados => {
            const lowerBody = document.querySelector('.lower-body');
            let html = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Nivel</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;
            grados.forEach(grado => {
                html += `
          <tr>
            <td>${grado.id_grado}</td>
            <td>${grado.nombre_grad}</td>
            <td>${grado.nombre_niv}</td>
            <td>
              <a href="/secretario/aulas/grados/editar?id=${grado.id_grado}"><button>Editar</button></a>
              <button class="btn-eliminar-grado" data-id="${grado.id_grado}">Eliminar</button>
            </td>
          </tr>
        `;
            });
            html += '</tbody></table>';
            lowerBody.innerHTML = document.querySelector('.title-lower-body').outerHTML + html;
        });
}

document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/aulas/grados/crear')) {
    // Cargar niveles para el select
    fetchAuth('/api/niveles')
      .then(res => res.json())
      .then(niveles => {
        const select = document.getElementById('select-nivel');
        niveles.forEach(niv => {
          select.innerHTML += `<option value="${niv.id_nivel}">${niv.nombre_niv}</option>`;
        });
      });

    // Crear grado
    const form = document.getElementById('form-crear-grado');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = {
        nombre_grad: form.nombre_grad.value,
        niveles_id_nivel: form.niveles_id_nivel.value
      };
      fetchAuth('/api/grados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.message) {
            alert('Grado creado');
            window.location.href = '/secretario/aulas/grados';
          } else {
            alert(result.error || 'Error al crear');
          }
        });
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/aulas/grados/editar')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const form = document.getElementById('form-editar-grado');
    // Cargar niveles
    fetchAuth('/api/niveles')
      .then(res => res.json())
      .then(niveles => {
        const select = document.getElementById('select-nivel');
        niveles.forEach(niv => {
          select.innerHTML += `<option value="${niv.id_nivel}">${niv.nombre_niv}</option>`;
        });
        // Cargar datos actuales del grado
        fetchAuth(`/api/grados/${id}`)
          .then(res => res.json())
          .then(grado => {
            form.nombre_grad.value = grado.nombre_grad;
            form.niveles_id_nivel.value = grado.niveles_id_nivel;
          });
      });

    // Guardar cambios
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = {
        nombre_grad: form.nombre_grad.value,
        niveles_id_nivel: form.niveles_id_nivel.value
      };
      fetchAuth(`/api/grados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.message) {
            alert('Grado actualizado');
            window.location.href = '/secretario/aulas/grados';
          } else {
            alert(result.error || 'Error al actualizar');
          }
        });
    });
  }
});