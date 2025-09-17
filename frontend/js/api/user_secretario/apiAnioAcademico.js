document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/anio_academico')) {
        fetch('/api/anio_academico')
            .then(res => res.json())
            .then(anios => {
                const contenedor = document.getElementById('anio-academico-list');
                contenedor.innerHTML = '';
                anios.forEach(a => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                    <td>${a.id_anio_escolar}</td>
                    <td>${a.anio_acad}</td>
                    <td>${a.fecha_inicio_anio.split('T')[0]}</td>
                    <td>${a.fecha_fin_anio.split('T')[0]}</td>
                    <td>${a.descripcion_anio}</td>
                    <td>${a.estado}</td>
                    <td>
                    <a href="/secretario/anio_academico/editar?id=${a.id_anio_escolar}"><button>Editar</button></a>
                    </td>
                    `;
                    contenedor.appendChild(tr);
                    });
            });
    }
});
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/anio_academico/crear')) {
        const form = document.getElementById('form-crear-anio');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const data = {
                anio_acad: form.anio_acad.value,
                fecha_inicio_anio: form.fecha_inicio_anio.value,
                fecha_fin_anio: form.fecha_fin_anio.value,
                descripcion_anio: form.descripcion_anio.value,
                estado: form.estado.value
            };
            fetch('/api/anio_academico', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(result => {
                    if (result.id) {
                        alert('Año académico creado');
                        window.location.href = '/secretario/anio_academico';
                    } else {
                        alert(result.error || 'Error al crear');
                    }
                });
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/anio_academico/editar')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const form = document.getElementById('form-editar-anio');
        fetch(`/api/anio_academico/${id}`)
            .then(res => res.json())
            .then(anio => {
                form.anio_acad.value = anio.anio_acad;
                form.fecha_inicio_anio.value = anio.fecha_inicio_anio.split('T')[0];
                form.fecha_fin_anio.value = anio.fecha_fin_anio.split('T')[0];
                form.descripcion_anio.value = anio.descripcion_anio;
                form.estado.value = anio.estado;
            });
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const data = {
                anio_acad: form.anio_acad.value,
                fecha_inicio_anio: form.fecha_inicio_anio.value,
                fecha_fin_anio: form.fecha_fin_anio.value,
                descripcion_anio: form.descripcion_anio.value,
                estado: form.estado.value
            };
            fetch(`/api/anio_academico/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(result => {
                    if (result) {
                        alert('Año académico actualizado');
                        window.location.href = '/secretario/anio_academico';
                    } else {
                        alert(result.error || 'Error al actualizar');
                    }
                });
        });
    }
});