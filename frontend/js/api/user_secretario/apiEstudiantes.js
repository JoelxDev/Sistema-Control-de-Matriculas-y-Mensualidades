document.addEventListener('DOMContentLoaded', function () {
    // Si estamos en la página principal de estudiantes
    if (window.location.pathname.endsWith('/estudiantes')) {
        cargarEstudiantes();
        configurarBusqueda();
    }
    
    // Si estamos en la página de detalle de estudiante
    if (window.location.pathname.endsWith('/informacion_estudiante')) {
        cargarDetalleEstudiante();
    }
});

// ✅ CAMBIAR la función cargarEstudiantes para usar la API correcta:
function cargarEstudiantes() {
    fetch('/api/estudiantes')  // ← CAMBIAR AQUÍ
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(estudiantes => {
            console.log('Estudiantes recibidos:', estudiantes);
            
            if (!Array.isArray(estudiantes)) {
                throw new Error('La respuesta no es un array');
            }
            
            const tbody = document.querySelector('table tbody');
            if (!tbody) {
                console.error('No se encontró el tbody de la tabla');
                return;
            }
            
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
                            <a href="/secretario/estudiantes/informacion_estudiante?id=${est.id_estudiante}">
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

// ... resto de funciones sin cambios ...

// ✅ CAMBIAR la función cargarDetalleEstudiante:
function cargarDetalleEstudiante() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        alert('ID de estudiante no válido');
        return;
    }
    
    fetch(`/api/estudiantes/${id}`)  // ← CAMBIAR AQUÍ
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Datos del estudiante:', data);
            
            const { estudiante, responsables } = data;
            
            // Llenar datos del estudiante
            llenarDatosEstudiante(estudiante);
            
            // Llenar datos de responsables
            if (responsables && Array.isArray(responsables)) {
                llenarDatosResponsables(responsables);
            }
        })
        .catch(error => {
            console.error('Error al cargar detalle del estudiante:', error);
            alert('Error al cargar los datos del estudiante: ' + error.message);
        });
}
function configurarBusqueda() {
    const inputBusqueda = document.querySelector('.filtro-por-dni input');
    
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', function() {
            const valorBusqueda = this.value.toLowerCase();
            const filas = document.querySelectorAll('table tbody tr');
            
            filas.forEach(fila => {
                const dni = fila.children[2].textContent.toLowerCase(); // Columna DNI
                const nombre = fila.children[0].textContent.toLowerCase(); // Columna Nombre
                const apellido = fila.children[1].textContent.toLowerCase(); // Columna Apellido
                
                // Buscar en DNI, nombre o apellido
                if (dni.includes(valorBusqueda) || 
                    nombre.includes(valorBusqueda) || 
                    apellido.includes(valorBusqueda)) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    }
}

// Función para cargar el detalle completo del estudiante
function cargarDetalleEstudiante() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        alert('ID de estudiante no válido');
        return;
    }
    
    fetch(`/api/estudiantes/${id}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Datos del estudiante:', data);
            
            const { estudiante, responsables } = data;
            
            // Llenar datos del estudiante
            llenarDatosEstudiante(estudiante);
            
            // Llenar datos de responsables
            if (responsables && Array.isArray(responsables)) {
                llenarDatosResponsables(responsables);
            }
        })
        .catch(error => {
            console.error('Error al cargar detalle del estudiante:', error);
            alert('Error al cargar los datos del estudiante: ' + error.message);
        });
}

// Función para llenar los datos del estudiante
function llenarDatosEstudiante(estudiante) {
    const datosEst = document.querySelector('.estudiante .datos ul');
    
    if (datosEst) {
        const fechaNacimiento = estudiante.fecha_nacimiento_est ? 
            estudiante.fecha_nacimiento_est.split('T')[0] : 'No especificado';
        
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
}

// Función para llenar los datos de los responsables
function llenarDatosResponsables(responsables) {
    responsables.forEach(resp => {
        if (resp.tipo_vinculo === 'padre') {
            const datosPadre = document.querySelector('.padre-estudiante .datos ul');
            if (datosPadre) {
                datosPadre.innerHTML = `
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
            const datosMadre = document.querySelector('.madre-estudiante .datos ul');
            if (datosMadre) {
                datosMadre.innerHTML = `
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
            // Crear sección de tutor si no existe
            crearSeccionTutor(resp);
        }
    });
}

// Función para crear la sección del tutor dinámicamente
function crearSeccionTutor(tutor) {
    const contenedorDatos = document.querySelector('.datos-estudiante');
    
    // Verificar si ya existe la sección del tutor
    if (!document.querySelector('.tutor-estudiante')) {
        const seccionTutor = document.createElement('div');
        seccionTutor.className = 'tutor-estudiante';
        seccionTutor.innerHTML = `
            <div class="titulo">
                <h2>Tutor</h2>
            </div>
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
        
        contenedorDatos.appendChild(seccionTutor);
    }
}
function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return '';
    // Extrae solo la fecha si viene con hora
    const soloFecha = fechaNacimiento.split('T')[0];
    const fecha = new Date(soloFecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
    }
    return edad;
}