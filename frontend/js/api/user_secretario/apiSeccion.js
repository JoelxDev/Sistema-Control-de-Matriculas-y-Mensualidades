import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/aulas/secciones')) {
    cargarSecciones();

    // Delegación para eliminar
    document.body.addEventListener('click', function (e) {
      if (e.target.classList.contains('btn-eliminar-seccion')) {
        const id = e.target.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar esta sección?')) {
          fetchAuth(`/api/secciones/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
              if (result.message) cargarSecciones();
              else alert(result.error || 'Error al eliminar');
            });
        }
      }
    });
  }
});

function cargarSecciones() {
  fetchAuth('/api/secciones')
    .then(res => res.json())
    .then(secciones => {
      const lowerBody = document.querySelector('.lower-body');
      let html = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Grado</th>
              <th>Nivel</th>
              <th>Aula</th>
              <th>Capacidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;
      secciones.forEach(sec => {
        html += `
          <tr>
            <td>${sec.id_seccion}</td>
            <td>${sec.nombre}</td>
            <td>${sec.nombre_grad}</td>
            <td>${sec.nombre_niv}</td>
            <td>${sec.aulas_id_aula}</td>
            <td>${sec.capacidad_maxima}</td>
            <td>
              <a href="/secretario/aulas/secciones/editar?id=${sec.id_seccion}"><button>Editar</button></a>
              <button class="btn-eliminar-seccion" data-id="${sec.id_seccion}">Eliminar</button>
            </td>
          </tr>
        `;
      });
      html += '</tbody></table>';
      lowerBody.innerHTML = document.querySelector('.title-lower-body').outerHTML + html;
    });
}

document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/aulas/secciones/crear')) {
    // Cargar grados
    fetchAuth('/api/grados')
      .then(res => res.json())
      .then(grados => {
        const select = document.getElementById('select-grado');
        grados.forEach(g => {
          select.innerHTML += `<option value="${g.id_grado}">${g.nombre_grad} (${g.nombre_niv})</option>`;
        });
      });
    // Cargar aulas
    fetchAuth('/api/aulas')
      .then(res => res.json())
      .then(aulas => {
        const select = document.getElementById('select-aula');
        aulas.forEach(a => {
          select.innerHTML += `<option value="${a.id_aula}">Aula ${a.id_aula} (${a.capacidad_maxima})</option>`;
        });
      });

    // Crear sección
    const form = document.getElementById('form-crear-seccion');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = {
        nombre: form.nombre.value,
        grados_id_grado: form.grados_id_grado.value,
        aulas_id_aula: form.aulas_id_aula.value
      };
      fetchAuth('/api/secciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.message) {
            alert('Sección creada');
            window.location.href = '/secretario/aulas/secciones';
          } else {
            alert(result.error || 'Error al crear');
          }
        });
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/aulas/secciones/editar')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const form = document.getElementById('form-editar-seccion');
    // Cargar grados y aulas
    Promise.all([
      fetchAuth('/api/grados').then(res => res.json()),
      fetchAuth('/api/aulas').then(res => res.json()),
      fetchAuth(`/api/secciones/${id}`).then(res => res.json())
    ]).then(([grados, aulas, seccion]) => {
      const selectGrado = document.getElementById('select-grado');
      grados.forEach(g => {
        selectGrado.innerHTML += `<option value="${g.id_grado}">${g.nombre_grad} (${g.nombre_niv})</option>`;
      });
      selectGrado.value = seccion.grados_id_grado;

      const selectAula = document.getElementById('select-aula');
      aulas.forEach(a => {
        selectAula.innerHTML += `<option value="${a.id_aula}">Aula ${a.id_aula} (${a.capacidad_maxima})</option>`;
      });
      selectAula.value = seccion.aulas_id_aula;

      form.nombre.value = seccion.nombre;
    });

    // Guardar cambios
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = {
        nombre: form.nombre.value,
        grados_id_grado: form.grados_id_grado.value,
        aulas_id_aula: form.aulas_id_aula.value
      };
      fetchAuth(`/api/secciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.message) {
            alert('Sección actualizada');
            window.location.href = '/secretario/aulas/secciones';
          } else {
            alert(result.error || 'Error al actualizar');
          }
        });
    });
  }
});