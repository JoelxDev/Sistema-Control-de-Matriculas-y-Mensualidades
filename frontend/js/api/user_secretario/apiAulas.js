document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('/aulas/aulas')) {
    cargarAulas();

    // Delegación para eliminar
    document.body.addEventListener('click', function (e) {
      if (e.target.classList.contains('btn-eliminar-aula')) {
        const id = e.target.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar esta aula?')) {
          fetch(`/api/aulas/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
              if (result.message) cargarAulas();
              else alert(result.error || 'Error al eliminar');
            });
        }
      }
    });
  }

  if (window.location.pathname.endsWith('/aulas/aulas/crear')) {
    const form = document.getElementById('form-crear-aula');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = {
        capacidad_maxima: form.capacidad_maxima.value,
        estado: form.estado.value
      };
      fetch('/api/aulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.message) {
            alert('Aula creada');
            window.location.href = '/secretario/aulas/aulas';
          } else {
            alert(result.error || 'Error al crear');
          }
        });
    });
  }

  if (window.location.pathname.endsWith('/aulas/aulas/editar')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const form = document.getElementById('form-editar-aula');
    // Cargar datos actuales
    fetch(`/api/aulas/${id}`)
      .then(res => res.json())
      .then(aula => {
        form.capacidad_maxima.value = aula.capacidad_maxima;
        form.estado.value = aula.estado;
      });
    // Guardar cambios
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = {
        capacidad_maxima: form.capacidad_maxima.value,
        estado: form.estado.value
      };
      fetch(`/api/aulas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.message) {
            alert('Aula actualizada');
            window.location.href = '/secretario/aulas/aulas';
          } else {
            alert(result.error || 'Error al actualizar');
          }
        });
    });
  }

});

function cargarAulas() {
  fetch('/api/aulas')
    .then(res => res.json())
    .then(aulas => {
      const lowerBody = document.querySelector('.lower-body');
      let html = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Capacidad Máxima</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;
      aulas.forEach(aula => {
        html += `
          <tr>
            <td>${aula.id_aula}</td>
            <td>${aula.capacidad_maxima}</td>
            <td>${aula.estado}</td>
            <td>
              <a href="/secretario/aulas/aulas/editar?id=${aula.id_aula}"><button>Editar</button></a>
              <button class="btn-eliminar-aula" data-id="${aula.id_aula}">Eliminar</button>
            </td>
          </tr>
        `;
      });
      html += '</tbody></table>';
      lowerBody.innerHTML = document.querySelector('.title-lower-body').outerHTML + html;
    });
}
