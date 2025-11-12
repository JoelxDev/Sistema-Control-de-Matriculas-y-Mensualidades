import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

function cargarDescuentos() {
    fetchAuth('/api/descuentos')
        .then(response => response.json())
        .then(descuentos =>{
            const tbody = document.getElementById('tabla-descuentos-list');
            tbody.innerHTML = '';
            descuentos.forEach(descuento => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${descuento.id_descuento}</td>
                    <td>${descuento.nombre_desc}</td>
                    <td>${descuento.porcentaje_desc}</td>
                    <td>${descuento.descripcion_desc}</td>
                    <td>
                        <a href="/secretario/descuentos/editar?id=${descuento.id_descuento}"><button>Editar</button></a>
                        <button class="btn-eliminar-descuento" data-id="${descuento.id_descuento}">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
    }

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/descuentos')) {
        cargarDescuentos();
    }
    if(window.location.pathname.endsWith('/descuentos/crear')){
        const form = document.getElementById('form-crear-descuento');
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = {
                nombre_desc: form.nombre_desc.value,
                porcentaje_desc: form.porcentaje_desc.value,
                descripcion_desc: form.descripcion_desc.value
            }
            fetchAuth('/api/descuentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    alert('Descuento creado exitosamente');
                    window.location.href = '/secretario/descuentos';
                } else {
                    alert(data.error || 'Error al crear el descuento');
                }
            });
        });
    }
    if(window.location.pathname.endsWith('/descuentos/editar')){
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        const form = document.getElementById('form-editar-descuento');
        fetchAuth(`/api/descuentos/${id}`)
            .then(response => response.json())
            .then(descuento => {
                form.nombre_desc.value = descuento.nombre_desc;
                form.porcentaje_desc.value = descuento.porcentaje_desc;
                form.descripcion_desc.value = descuento.descripcion_desc;
            });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = {
                nombre_desc: form.nombre_desc.value,
                porcentaje_desc: form.porcentaje_desc.value,
                descripcion_desc: form.descripcion_desc.value
            };
            fetchAuth(`/api/descuentos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(async response => {
                const data = await response.json().catch(() => ({}));
                if (response.ok) {
                    alert('Descuento editado exitosamente');
                    window.location.href = '/secretario/descuentos';
                } else {
                    // mostrar mensaje devuelto por backend o genérico
                    alert(data.error || data.message || 'Error al editar el descuento');
                }
            })
            .catch(() => {
                alert('Error de red al editar el descuento');
            });
        });
    }
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-eliminar-descuento')) {
            const id = event.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar este descuento?')) {
                fetchAuth(`/api/descuentos/${id}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert('Descuento eliminado exitosamente');
                        window.location.reload();
                    } else {
                        alert(data.error || 'Error al eliminar el descuento');
                    }
                });
            }
        }
    });
    });