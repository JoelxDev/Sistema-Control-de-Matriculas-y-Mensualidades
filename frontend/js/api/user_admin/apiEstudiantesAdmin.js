import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', function () {
    // Página principal de estudiantes
    if (window.location.pathname.endsWith('/estudiantes')) {
        cargarEstudiantes();
        configurarBusqueda();
    }
    
    // Página de detalle de estudiante
    if (window.location.pathname.endsWith('/informacion_estudiante')) {
        cargarDetalleEstudiante();
    }
});

// Cargar listado de estudiantes
function cargarEstudiantes() {
    fetchAuth('/api/estudiantes')
        .then(res => {
            if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
            return res.json();
        })
        .then(estudiantes => {
            if (!Array.isArray(estudiantes)) throw new Error('La respuesta no es un array');

            const tbody = document.querySelector('table tbody');
            if (!tbody) return;

            tbody.innerHTML = '';

            if (estudiantes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10">No hay estudiantes registrados</td></tr>';
                return;
            }

            estudiantes.forEach(est => {
                const fechaMatricula = est.fecha_matricula ? est.fecha_matricula.split('T')[0] : '';
                tbody.innerHTML += `
                    <tr>
                        <td>${est.nombre_est}</td>
                        <td>${est.apellido_est}</td>
                        <td>${est.dni_est}</td>
                        <td>${fechaMatricula}</td>
                        <td>${est.seccion || ''}</td>
                        <td>${est.periodo || ''}</td>
                        <td>${est.estado_matr}</td>
                        <td>${est.descuento || ''}</td>
                        <td>${est.titular_est}</td>
                        <td>
                            <a href="/admin/estudiantes/informacion_estudiante?id=${est.id_estudiante}">
                                <button>Mas Inf.</button>
                            </a>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Error al cargar estudiantes:', error);
            const tbody = document.querySelector('table tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="10">Error al cargar estudiantes: ${error.message}</td></tr>`;
            }
        });
}

// Buscar por DNI/Nombre/Apellido
function configurarBusqueda() {
    const inputBusqueda = document.querySelector('.filtro-por-dni input');
    if (!inputBusqueda) return;

    inputBusqueda.addEventListener('input', function() {
        const valor = this.value.toLowerCase();
        const filas = document.querySelectorAll('table tbody tr');
        filas.forEach(fila => {
            const dni = fila.children[2]?.textContent.toLowerCase() || '';
            const nombre = fila.children[0]?.textContent.toLowerCase() || '';
            const apellido = fila.children[1]?.textContent.toLowerCase() || '';
            fila.style.display = (dni.includes(valor) || nombre.includes(valor) || apellido.includes(valor)) ? '' : 'none';
        });
    });
}

// Cargar detalle del estudiante (única definición)
function cargarDetalleEstudiante() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { alert('ID de estudiante no válido'); return; }

    fetch(`/api/estudiantes/${id}`)
        .then(res => {
            if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
            return res.json();
        })
        .then(data => {
            const { estudiante, responsables } = data;
            if (estudiante) llenarDatosEstudiante(estudiante);
            if (Array.isArray(responsables)) llenarDatosResponsables(responsables);
        })
        .catch(error => {
            console.error('Error al cargar detalle del estudiante:', error);
            alert('Error al cargar los datos del estudiante: ' + error.message);
        });
}

// Pintar datos del estudiante
function llenarDatosEstudiante(estudiante) {
    const datosEst = document.querySelector('.estudiante .datos ul');
    if (!datosEst) return;

    const fechaNacimiento = estudiante.fecha_nacimiento_est ? estudiante.fecha_nacimiento_est.split('T')[0] : 'No especificado';
    datosEst.innerHTML = `
        <li>Nombre: ${estudiante.nombre_est}</li>
        <li>Apellido: ${estudiante.apellido_est}</li>
        <li>DNI: ${estudiante.dni_est}</li>
        <li>Fecha Nacimiento: ${fechaNacimiento}</li>
        <li>Vive con los padres: ${estudiante.convive_padres || 'No especificado'}</li>
        <li>Edad: ${calcularEdad(estudiante.fecha_nacimiento_est) || 'No calculado'}</li>
        <li>Genero: ${estudiante.genero || 'No especificado'}</li>
        <li>Estado: ${estudiante.estado_est}</li>
        <li>Discapacidad: ${estudiante.discapacidad_est || 'No'}</li>
        <li>Detalles de la discapacidad: ${estudiante.detalles_disc_est || 'Ninguno'}</li>
    `;
}

// Pintar datos de responsables
function llenarDatosResponsables(responsables) {
    responsables.forEach(resp => {
        if (resp.tipo_vinculo === 'padre') {
            const el = document.querySelector('.padre-estudiante .datos ul');
            if (el) {
                el.innerHTML = `
                    <li>Nombre: ${resp.nombre_resp || 'No especificado'}</li>
                    <li>Apellido: ${resp.apellido_resp || 'No especificado'}</li>
                    <li>DNI: ${resp.dni_resp || 'No especificado'}</li>
                    <li>Dirección domicilio: ${resp.direc_domic_resp || 'No especificado'}</li>
                    <li>Telefono: ${resp.telefono_resp || 'No especificado'}</li>
                    <li>Ocupacion: ${resp.ocupacion_resp || 'No especificado'}</li>
                    <li>Email: ${resp.email_resp || 'No especificado'}</li>
                    <li>Vinculo Estudiante: ${resp.parentesco_resp}</li>
                    <li>Observaciones: ${resp.observaciones_resp || 'Ninguna'}</li>
                `;
            }
        }
        if (resp.tipo_vinculo === 'madre') {
            const el = document.querySelector('.madre-estudiante .datos ul');
            if (el) {
                el.innerHTML = `
                    <li>Nombre: ${resp.nombre_resp || 'No especificado'}</li>
                    <li>Apellido: ${resp.apellido_resp || 'No especificado'}</li>
                    <li>DNI: ${resp.dni_resp || 'No especificado'}</li>
                    <li>Dirección domicilio: ${resp.direc_domic_resp || 'No especificado'}</li>
                    <li>Telefono: ${resp.telefono_resp || 'No especificado'}</li>
                    <li>Ocupacion: ${resp.ocupacion_resp || 'No especificado'}</li>
                    <li>Email: ${resp.email_resp || 'No especificado'}</li>
                    <li>Vinculo Estudiante: ${resp.parentesco_resp}</li>
                    <li>Observaciones: ${resp.observaciones_resp || 'Ninguna'}</li>
                `;
            }
        }
        if (resp.tipo_vinculo === 'tutor') {
            crearSeccionTutor(resp);
        }
    });
}

// Crear sección de tutor si no existe
function crearSeccionTutor(tutor) {
    const contenedor = document.querySelector('.datos-estudiante');
    if (!contenedor || document.querySelector('.tutor-estudiante')) return;

    const seccionTutor = document.createElement('div');
    seccionTutor.className = 'tutor-estudiante';
    seccionTutor.innerHTML = `
        <div class="titulo"><h2>Tutor</h2></div>
        <div class="datos">
            <ul>
                <li>Nombre: ${tutor.nombre_resp || 'No especificado'}</li>
                <li>Apellido: ${tutor.apellido_resp || 'No especificado'}</li>
                <li>DNI: ${tutor.dni_resp || 'No especificado'}</li>
                <li>Dirección domicilio: ${tutor.direc_domic_resp || 'No especificado'}</li>
                <li>Telefono: ${tutor.telefono_resp || 'No especificado'}</li>
                <li>Ocupacion: ${tutor.ocupacion_resp || 'No especificado'}</li>
                <li>Email: ${tutor.email_resp || 'No especificado'}</li>
                <li>Vinculo Estudiante: ${tutor.parentesco_resp}</li>
                <li>Observaciones: ${tutor.observaciones_resp || 'Ninguna'}</li>
            </ul>
        </div>
    `;
    contenedor.appendChild(seccionTutor);
}

// Utilidad: calcular edad
function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return '';
    const soloFecha = fechaNacimiento.split('T')[0];
    const fecha = new Date(soloFecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edad--;
    return edad;
}