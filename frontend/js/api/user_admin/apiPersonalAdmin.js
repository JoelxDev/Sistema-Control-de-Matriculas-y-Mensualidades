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
                    const cargo_per = item.usuario ? item.usuario.roll : '';
                    const estado = item.cargo_per;
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
            <td>${nombreCompleto}</td>
            <td>${telefono}</td>
            <td>${username}</td>
            <td>${dni}</td>
            <td>${cargo_per}</td>
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
            } else if (data.cargo.toLowerCase().includes('secretaria')) {
                data.roll = 'secretaria';
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

document.addEventListener('DOMContentLoaded', async function (){
    const form = document.getElementById('form-editar-personal');
    if (form){
        // 1. Obtener el id de la URL
        const params = new URLSearchParams(window.location.search)
        const id = params.get('id');
        if(!id){
            alert('ID no encontrado');
            return;
        }
        // 2. Traer los datos actuales del personal + usuario
        const res = await fetch (`/api/admin/personal/${id}`);
        const data = await res.json();
        // 3. Llemar eñ formulario con los datos actuales
        form.nombre_per.value = data.nombre_per;
        form.apellido.value = data.apellido;
        form.cargo_per.value = data.cargo_per;
        form.dni.value = data.dni;
        form.nombre_usuario.value = data.usuario ? data.usuario.nombre_usuario : '';
        form.roll.value = data.usuario ? data.usuario.roll : '';
        form.estado_us.value = data.usuario ? data.usuario.estado_us : '';
        // 4. Al enviar, hacer PUT a la API 
        form.addEventListener('submit', async function (e){
            e.preventDefault();
            const body = {
                nombre_per: form.nombre_per.value,
                apellido: form.apellido.value,
                cargo_per: form.cargo_per.value,
                dni: form.dni.value,
                nombre_usuario: form.nombre_usuario.value,
                roll: form.roll.value,
                estado_us: form.estado_us.value
            
            };
            fetch(`/api/admin/usuarios-personal/${data.usuario.usuario_id}`,{
                method: 'PUT',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })
            .then(res => res.json())
            .then(result => {
                if(result.message){
                    alert('¡Datos actualizados!')
                    window.location.href = '/admin/personal_administrativo';
                }else {
                    alert('Error al actualizar: ' + (result.error || ''));
                }
            })
            .catch(() => alert('Error al conectar con el servidor'));
        })
    }
})