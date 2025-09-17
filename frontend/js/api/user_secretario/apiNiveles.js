document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/aulas/niveles')) {
        cargarNiveles();

        // Delegación para eliminar
        document.body.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-eliminar-nivel')) {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que deseas eliminar este nivel?')) {
                    fetch(`/api/niveles/${id}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(result => {
                            if (result.message) cargarNiveles();
                            else alert(result.error || 'Error al eliminar');
                        });
                }
            }
        });
    }
});

function cargarNiveles() {
    fetch('/api/niveles')
        .then(res => res.json())
        .then(niveles => {
            const lowerBody = document.querySelector('.lower-body');
            let html = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;
            niveles.forEach(niv => {
                html += `
          <tr>
            <td>${niv.id_nivel}</td>
            <td>${niv.nombre_niv}</td>
            <td>
              <a href="/secretario/aulas/niveles/editar?id=${niv.id_nivel}"><button>Editar</button></a>
              <button class="btn-eliminar-nivel" data-id="${niv.id_nivel}">Eliminar</button>
            </td>
          </tr>
        `;
            });
            html += '</tbody></table>';
            lowerBody.innerHTML = document.querySelector('.title-lower-body').outerHTML + html;
        });
}

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/aulas/niveles/crear')) {
        const form = document.getElementById('form-crear-nivel');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const data = { nombre_niv: form.nombre_niv.value };
            fetch('/api/niveles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(result => {
                    if (result.message) {
                        alert('Nivel creado');
                        window.location.href = '/secretario/aulas/niveles';
                    } else {
                        alert(result.error || 'Error al crear');
                    }
                });
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/aulas/niveles/editar')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const form = document.getElementById('form-editar-nivel');
        // Cargar datos actuales
        fetch(`/api/niveles/${id}`)
            .then(res => res.json())
            .then(niv => {
                form.nombre_niv.value = niv.nombre_niv;
            });
        // Guardar cambios
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const data = { nombre_niv: form.nombre_niv.value };
            fetch(`/api/niveles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(result => {
                    if (result.message) {
                        alert('Nivel actualizado');
                        window.location.href = '/secretario/aulas/niveles';
                    } else {
                        alert(result.error || 'Error al actualizar');
                    }
                });
        });
    }
});