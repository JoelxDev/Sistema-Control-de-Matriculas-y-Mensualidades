// Cargar niveles al iniciar

// Enviar formulario
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.datos-tutor').style.display = 'none';
    document.getElementById('tutor').addEventListener('change', function () {
        document.querySelector('.datos-tutor').style.display = this.value === 'si' ? 'block' : 'none';
    });
    fetch('/api/niveles')
        .then(res => res.json())
        .then(niveles => {
            const nivelSelect = document.getElementById('para_nivel');
            nivelSelect.innerHTML = '<option value="">Seleccione nivel</option>';
            niveles.forEach(niv => {
                nivelSelect.innerHTML += `<option value="${niv.id_nivel}">${niv.nombre_niv}</option>`;
            });
        });

    // Cuando selecciona un nivel, carga los grados de ese nivel
    document.getElementById('para_nivel').addEventListener('change', function () {
        const nivelId = this.value;
        const gradoSelect = document.getElementById('para_grado');
        gradoSelect.innerHTML = '<option value="">Seleccione grado</option>';
        document.getElementById('para_seccion').innerHTML = '<option value="">Seleccione sección</option>';
        if (!nivelId) return;
        fetch(`/api/grados?nivel=${nivelId}`)
            .then(res => res.json())
            .then(grados => {
                grados.forEach(g => {
                    gradoSelect.innerHTML += `<option value="${g.id_grado}">${g.nombre_grad}</option>`;
                });
            });
    });

    // Cuando selecciona un grado, carga las secciones de ese grado
    document.getElementById('para_grado').addEventListener('change', function () {
        const gradoId = this.value;
        const seccionSelect = document.getElementById('para_seccion');
        seccionSelect.innerHTML = '<option value="">Seleccione sección</option>';
        if (!gradoId) return;
        fetch(`/api/secciones?grado=${gradoId}`)
            .then(res => res.json())
            .then(secciones => {
                secciones.forEach(s => {
                    seccionSelect.innerHTML += `<option value="${s.id_seccion}">${s.nombre}</option>`;
                });
            });
    });
    // Para años académicos
    fetch('/api/anio_academico')
        .then(res => res.json())
        .then(anios => {
            const anioSelect = document.getElementById('anio_academico');
            anioSelect.innerHTML = '<option value="">Seleccione año académico</option>';
            anios.forEach(a => {
                anioSelect.innerHTML += `<option value="${a.id_anio_escolar}">${a.anio_acad}</option>`;
            });
        });

    // Cuando el usuario selecciona un año académico, carga los periodos de ese año
    document.getElementById('anio_academico').addEventListener('change', function () {
        const anioId = this.value;
        const periodoSelect = document.getElementById('periodo');
        if (!anioId) {
            periodoSelect.innerHTML = '<option value="">Seleccione periodo</option>';
            return;
        }
        fetch(`/api/periodos?anio=${anioId}`)
            .then(res => res.json())
            .then(periodos => {
                periodoSelect.innerHTML = '<option value="">Seleccione periodo</option>';
                periodos.forEach(p => {
                    periodoSelect.innerHTML += `<option value="${p.id_periodo}">${p.nombre_per}</option>`;
                });
            });
    });

    // Cargar descuentos al iniciar
    fetch('/api/descuentos')
        .then(res => res.json())
        .then(descuentos => {
            const descuentoSelect = document.getElementById('descuento');
            descuentoSelect.innerHTML = '<option value="">Sin descuento</option>';
            descuentos.forEach(d => {
                descuentoSelect.innerHTML += `<option value="${d.id_descuento}">${d.nombre_desc} (${d.porcentaje_desc}%)</option>`;
            });
        });
    // Calcula la edad al cambiar la fecha de nacimiento
    document.getElementById('fecha_nacimiento_est').addEventListener('change', function () {
        const fechaNacimiento = this.value;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        document.getElementById('edad_est').value = edad;



    });
    const form = document.querySelector('.registrar-matricula form');
    if (form) {

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            // ✅ Detecta automáticamente si es creación o edición
            // Detectar si es edición o creación
            const isEditing = window.location.pathname.endsWith('/matriculas/editar');
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');

            // Si es edición, agregar ID del estudiante
            // Estudiante
            const estudiante = {
                nombre_est: formData.get('nombre_est'),
                apellido_est: formData.get('apellido_est'),
                dni_est: formData.get('dni_est'),
                fecha_nacimiento_est: formData.get('fecha_nacimiento_est'),
                estado_est: formData.get('estado'),
                titular_est: formData.get('titular_est'),
                convive_padres: formData.get('convive_padres'),
                genero: formData.get('genero'),
                discapacidad_est: formData.get('discapacidad_est'),
                detalles_disc_est: formData.get('detalles_disc_est'),
                descuentos_id_descuento: formData.get('descuento') || null
            };

            if (isEditing && window.estudianteId) {
                estudiante.id = window.estudianteId;
            }

            // Determinar URL y método
            const url = isEditing ? `/api/matriculas/${id}` : '/api/matriculas';
            const method = isEditing ? 'PUT' : 'POST';


            // Responsables
            const responsables = [];

            // Padre
            responsables.push({
                nombre_resp: formData.get('nombre_padre'),
                apellido_resp: formData.get('apellido_padre'),
                dni_resp: formData.get('dni_padre'),
                direc_domic_resp: formData.get('direccion_domicilio_padre'),
                parentesco_resp: "padre",
                telefono_resp: formData.get('telefono_padre'),
                // fecha_nacimiento_resp: formData.get('fecha_nac_padre'),
                ocupacion_resp: formData.get('ocupacion_padre'),
                email_resp: formData.get('correo_padre'),
                observaciones_resp: formData.get('observaciones_padre'),
                tipo_vinculo: "padre"
            });

            // Madre
            responsables.push({
                nombre_resp: formData.get('nombre_madre'),
                apellido_resp: formData.get('apellido_madre'),
                dni_resp: formData.get('dni_madre'),
                direc_domic_resp: formData.get('direc_domic_madre'),
                parentesco_resp: "madre",
                telefono_resp: formData.get('telefono_madre'),
                // fecha_nacimiento_resp: formData.get('fecha_nac_madre'),
                ocupacion_resp: formData.get('ocupacion_madre'),
                email_resp: formData.get('email_madre'),
                observaciones_resp: formData.get('observaciones_madre'),
                tipo_vinculo: "madre"
            });
            
            // Tutor solo si aplica
            if (document.querySelector('.datos-tutor').style.display === 'block') {
                responsables.push({
                    nombre_resp: formData.get('nombre_tutor'),
                    apellido_resp: formData.get('apellido_tutor'),
                    dni_resp: formData.get('dni_tutor'),
                    direc_domic_resp: formData.get('direccion_domicilio_tutor'),
                    parentesco_resp: "tutor",
                    telefono_resp: formData.get('telefono_tutor'),
                    // fecha_nacimiento_resp: formData.get('fecha_nac_tutor'),
                    ocupacion_resp: formData.get('ocupacion_tutor'),
                    email_resp: formData.get('correo_tutor'),
                    observaciones_resp: formData.get('observaciones_tutor'),
                    tipo_vinculo: "tutor"
                });
            }
            // Matrícula
            const matricula = {
                fecha_matricula: new Date().toISOString().slice(0, 19).replace('T', ' '),
                estado_matr: "Pendiente",
                tipo_mat: formData.get('tip_mat'),
                periodos_id_periodo: formData.get('periodo'),
                usuarios_id_usuarios: 1,
                secciones_id_seccion: formData.get('para_seccion')
            };
            
            // Enviar
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estudiante, responsables, matricula })
            })
                .then(res => res.json())
                .then(result => {
                    if (result.matriculaId || result.message) {
                        alert(isEditing ? 'Matrícula actualizada correctamente' : 'Matrícula registrada correctamente');
                        window.location.href = '/secretario/matriculas'; // ← AGREGAR ESTA LÍNEA
                    } else {
                        alert(result.error || 'Error al procesar matrícula');
                    }
                });
        });
    }

    // Si estamos en la página de edición-------------------------------------------
    if (window.location.pathname.endsWith('/matriculas/editar')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const form = document.querySelector('.registrar-matricula form');

        // Cargar datos completos de la matrícula
        fetch(`/api/matriculas/${id}`)
            .then(res => res.json())
            .then(data => {
                const { matricula, responsables } = data;
                // Agregar después:
                window.estudianteId = matricula.id_estudiante;
                // Llenar datos de la matrícula
                document.getElementById('anio_academico').value = matricula.id_anio_escolar;
                document.getElementById('periodo').value = matricula.id_periodo;
                document.getElementById('tip_mat').value = matricula.tipo_mat;
                document.getElementById('descuento').value = matricula.descuentos_id_descuento || '';

                // Llenar datos del estudiante
                form.querySelector('input[name="nombre_est"]').value = matricula.nombre_est;
                form.querySelector('input[name="apellido_est"]').value = matricula.apellido_est;
                form.querySelector('input[name="dni_est"]').value = matricula.dni_est;
                form.querySelector('input[name="fecha_nacimiento_est"]').value = matricula.fecha_nacimiento_est ? matricula.fecha_nacimiento_est.split('T')[0] : '';
                form.querySelector('select[name="titular_est"]').value = matricula.titular_est;
                form.querySelector('select[name="genero"]').value = matricula.genero;
                form.querySelector('select[name="discapacidad_est"]').value = matricula.discapacidad_est;
                form.querySelector('select[name="convive_padres"]').value = matricula.convive_padres;
                form.querySelector('input[name="detalles_disc_est"]').value = matricula.detalles_disc_est || '';
                form.querySelector('select[name="estado"]').value = matricula.estado_est || 'activo';
                // document.getElementById('edad_est').value = calcularEdadDesdeString(matricula.fecha_nacimiento_est);

                // Llenar datos de responsables
                responsables.forEach(resp => {
                    if (resp.tipo_vinculo === 'padre') {
                        form.querySelector('input[name="nombre_padre"]').value = resp.nombre_resp || '';
                        form.querySelector('input[name="apellido_padre"]').value = resp.apellido_resp || '';
                        form.querySelector('input[name="dni_padre"]').value = resp.dni_resp || '';
                        form.querySelector('input[name="direccion_domicilio_padre"]').value = resp.direc_domic_resp || '';
                        form.querySelector('input[name="telefono_padre"]').value = resp.telefono_resp || '';
                        // form.querySelector('input[name="fecha_nac_padre"]').value = resp.fecha_nacimiento_resp ? resp.fecha_nacimiento_resp.split('T')[0] : '';
                        form.querySelector('input[name="ocupacion_padre"]').value = resp.ocupacion_resp || '';
                        form.querySelector('input[name="correo_padre"]').value = resp.email_resp || '';
                        form.querySelector('input[name="observaciones_padre"]').value = resp.observaciones_resp || '';
                    }

                    if (resp.tipo_vinculo === 'madre') {
                        form.querySelector('input[name="nombre_madre"]').value = resp.nombre_resp || '';
                        form.querySelector('input[name="apellido_madre"]').value = resp.apellido_resp || '';
                        form.querySelector('input[name="dni_madre"]').value = resp.dni_resp || '';
                        form.querySelector('input[name="direc_domic_madre"]').value = resp.direc_domic_resp || '';
                        form.querySelector('input[name="telefono_madre"]').value = resp.telefono_resp || '';
                        // form.querySelector('input[name="fecha_nac_madre"]').value = resp.fecha_nacimiento_resp ? resp.fecha_nacimiento_resp.split('T')[0] : '';
                        form.querySelector('input[name="ocupacion_madre"]').value = resp.ocupacion_resp || '';
                        form.querySelector('input[name="email_madre"]').value = resp.email_resp || '';
                        form.querySelector('input[name="observaciones_madre"]').value = resp.observaciones_resp || '';
                    }

                    if (resp.tipo_vinculo === 'tutor') {
                        document.getElementById('tutor').value = 'si';
                        document.querySelector('.datos-tutor').style.display = 'block';
                        form.querySelector('input[name="nombre_tutor"]').value = resp.nombre_resp || '';
                        form.querySelector('input[name="apellido_tutor"]').value = resp.apellido_resp || '';
                        form.querySelector('input[name="dni_tutor"]').value = resp.dni_resp || '';
                        form.querySelector('input[name="direccion_domicilio_tutor"]').value = resp.direc_domic_resp || '';
                        form.querySelector('input[name="telefono_tutor"]').value = resp.telefono_resp || '';
                        form.querySelector('input[name="ocupacion_tutor"]').value = resp.ocupacion_resp || '';
                        form.querySelector('input[name="correo_tutor"]').value = resp.email_resp || '';
                        form.querySelector('input[name="observaciones_tutor"]').value = resp.observaciones_resp || '';
                    }
                });

                // Cargar selects en cascada después de llenar los valores
                // Trigger eventos para cargar periodos, grados, secciones
                if (matricula.id_anio_escolar) {
                    document.getElementById('anio_academico').dispatchEvent(new Event('change'));
                    // ✅ AGREGAR ESTO:
                    setTimeout(() => {
                        document.getElementById('periodo').value = matricula.id_periodo;
                    }, 300);
                }
                if (matricula.id_nivel) {
                    setTimeout(() => {
                        document.getElementById('para_nivel').value = matricula.id_nivel;
                        document.getElementById('para_nivel').dispatchEvent(new Event('change'));

                        // Después de cargar grados, seleccionar el grado
                        setTimeout(() => {
                            document.getElementById('para_grado').value = matricula.id_grado;
                            document.getElementById('para_grado').dispatchEvent(new Event('change'));

                            // Después de cargar secciones, seleccionar la sección
                            setTimeout(() => {
                                document.getElementById('para_seccion').value = matricula.id_seccion;
                            }, 300);
                        }, 300);
                    }, 500);
                }
            });
    }

    if (window.location.pathname.endsWith('/matriculas')) {
        cargarMatriculas();
    }

});
function cargarMatriculas() {
    fetch('/api/matriculas')
        .then(res => res.json())
        .then(matriculas => {
            const tbody = document.getElementById('matriculas-list');
            tbody.innerHTML = '';
            matriculas.forEach(m => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${m.id_matricula}</td>
          <td>${m.nombre_est} ${m.apellido_est}</td>
          <td>${m.titular_est}</td>
          <td>${m.tipo_mat}</td>
          <td>${m.estado_matr}</td>
          <td>${m.dni_est}</td>
          <td>${m.fecha_matricula.split('T')[0]}</td>
          <td>${m.nombre_usuario}</td>
          <td>${m.nombre_niv}</td>
          <td>${m.nombre_grad}</td>
          <td>${m.nombre_seccion}</td>
          <td>
            <a href="/secretario/matriculas/editar?id=${m.id_matricula}">
              <button>Editar</button>
            </a>
          </td>
        `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('Error:', err));
}

