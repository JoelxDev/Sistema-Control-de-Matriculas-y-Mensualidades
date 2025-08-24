document.addEventListener('DOMContentLoaded', function () {
  // Solo ejecuta esto si estamos en la página de personal admin
  if (window.location.pathname === '/admin/personal_administrativo') {
    fetch('/api/admin/personal')
      .then(response => response.json())
      .then(result => {
        // result: { total: N, data: [...] }
        const tbody = document.querySelector('.tabla-detalles tbody');
        tbody.innerHTML = '';
        result.data.forEach(item => {
          const nombreCompleto = `${item.nombre_per} ${item.apellido}`;
          const telefono = ''; // Si tienes el campo, cámbialo aquí
          const username = item.usuario ? item.usuario.nombre_usuario : '';
          const dni = item.dni;
          const cargo = item.cargo_per;
          const estado = item.usuario ? item.usuario.estado_us : '';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${nombreCompleto}</td>
            <td>${telefono}</td>
            <td>${username}</td>
            <td>${dni}</td>
            <td>${cargo}</td>
            <td>${estado}</td>
            <td>
              <a href="/admin/personal_administrativo/editar_personal?id=${item.personal_id}"><button>Editar</button></a>
              <button data-id="${item.personal_id}" class="btn-eliminar">Eliminar</button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        // Ejemplo de manejo para el botón eliminar (opcional)
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
          btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            if (confirm('¿Seguro que deseas eliminar este personal?')) {
              fetch(`/api/admin/usuarios-personal/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(() => location.reload());
            }
          });
        });
      })
      .catch(error => {
        console.error('Error al consumir la API:', error);
      });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-crear-personal');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => { data[key] = value; });

      // Generar usuario: primer nombre + primer apellido (en minúsculas, sin espacios)
      const primerNombre = data.nombre.split(' ')[0].toLowerCase();
      const primerApellido = data.apellido.split(' ')[0].toLowerCase();
      data.nombre_usuario = primerNombre + primerApellido;

      // Contraseña = dni
      data.contrasenia = data.dni;

      // Rol según cargo
      if (data.cargo.toLowerCase().includes('admin')) {
        data.roll = 'administrador';
      } else if (data.cargo.toLowerCase().includes('secretario')) {
        data.roll = 'secretario';
      } else {
        data.roll = 'otro';
      }

      fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(result => {
        if (result.message) {
          alert('¡Personal y usuario creados!');
          window.location.href = '/admin/personal_administrativo';
        } else {
          alert('Error al crear: ' + (result.error || ''));
        }
      })
      .catch(() => alert('Error al conectar con el servidor'));
    });
  }
});