document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const idSeccion = params.get('id');
    
    if (!idSeccion) return;
    if (window.location.pathname.endsWith('/secretario/aulas/detalles_seccion')) {

        fetch(`/api/secciones/${idSeccion}`)
            .then(res => res.json())
            .then(seccion => {
                const titulo = document.querySelector('.title-lower-body h1');
                if (seccion && titulo) {
                    titulo.textContent = `Estudiantes de la sección:  ${seccion.nombre_grad} - ${seccion.nombre} (${seccion.nombre_nivel})`;
                }
            });

        fetch(`/api/secciones/${idSeccion}/estudiantes`)
            .then(res => res.json())
            .then(estudiantes => {
                const tbody = document.querySelector('#tabla-estudiantes-seccion tbody');
                tbody.innerHTML = '';
                estudiantes.forEach(est => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${est.nombre_est}</td>
                            <td>${est.apellido_est}</td>
                            <td>${est.dni_est}</td>
                            <td>${est.fecha_nacimiento_est ? est.fecha_nacimiento_est.split('T')[0] : ''}</td>
                            <td>${est.titular_est || ''}</td>
                            <td>${est.discapacidad_est || ''}</td>
                            <td>${est.estado_est || ''}</td>
                            <td>${est.detalles_disc_est || ''}</td>
                        </tr>
                    `;
                });
            })
            .catch(error => {
                alert('Error al cargar estudiantes de la sección');
            });
    }
});