// ...existing code...
import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.datos-tutor').style.display = 'none';
    document.getElementById('tutor').addEventListener('change', function () {
        document.querySelector('.datos-tutor').style.display = this.value === 'si' ? 'block' : 'none';
    });

    // Carga inicial de selects (niveles, años, descuentos, etc.)
    fetchAuth('/api/niveles')
        .then(res => res.json())
        .then(niveles => {
            const nivelSelect = document.getElementById('para_nivel');
            nivelSelect.innerHTML = '<option value="">Seleccione nivel</option>';
            niveles.forEach(niv => {
                nivelSelect.innerHTML += `<option value="${niv.id_nivel}">${niv.nombre_niv}</option>`;
            });
        });

    document.getElementById('para_nivel').addEventListener('change', function () {
        const nivelId = this.value;
        const gradoSelect = document.getElementById('para_grado');
        gradoSelect.innerHTML = '<option value="">Seleccione grado</option>';
        document.getElementById('para_seccion').innerHTML = '<option value="">Seleccione sección</option>';
        if (!nivelId) return;
        fetchAuth(`/api/grados?nivel=${nivelId}`)
            .then(res => res.json())
            .then(grados => {
                grados.forEach(g => {
                    gradoSelect.innerHTML += `<option value="${g.id_grado}">${g.nombre_grad}</option>`;
                });
            });
    });

    document.getElementById('para_grado').addEventListener('change', function () {
        const gradoId = this.value;
        const seccionSelect = document.getElementById('para_seccion');
        seccionSelect.innerHTML = '<option value="">Seleccione sección</option>';
        if (!gradoId) return;
        fetchAuth(`/api/secciones?grado=${gradoId}`)
            .then(res => res.json())
            .then(secciones => {
                secciones.forEach(s => {
                    seccionSelect.innerHTML += `<option value="${s.id_seccion}">${s.nombre}</option>`;
                });
            });
    });

    fetchAuth('/api/anio_academico')
        .then(res => res.json())
        .then(anios => {
            const anioSelect = document.getElementById('anio_academico');
            anioSelect.innerHTML = '<option value="">Seleccione año académico</option>';
            anios.forEach(a => {
                anioSelect.innerHTML += `<option value="${a.id_anio_escolar}">${a.anio_acad}</option>`;
            });
        });

    document.getElementById('anio_academico').addEventListener('change', function () {
        const anioId = this.value;
        const periodoSelect = document.getElementById('periodo');
        periodoSelect.innerHTML = '<option value="">Seleccione periodo</option>';
        if (!anioId) return;
        fetchAuth(`/api/periodos?anio=${anioId}`)
            .then(res => res.json())
            .then(periodos => {
                periodoSelect.innerHTML = '<option value="">Seleccione periodo</option>';
                periodos.forEach(p => {
                    periodoSelect.innerHTML += `<option value="${p.id_periodo}">${p.nombre_per}</option>`;
                });
            });
    });

    fetchAuth('/api/descuentos')
        .then(res => res.json())
        .then(descuentos => {
            const descuentoSelect = document.getElementById('descuento');
            descuentoSelect.innerHTML = '<option value="">Sin descuento</option>';
            descuentos.forEach(d => {
                descuentoSelect.innerHTML += `<option value="${d.id_descuento}">${d.nombre_desc} (${d.porcentaje_desc}%)</option>`;
            });
        });

    document.getElementById('fecha_nacimiento_est').addEventListener('change', function () {
        const fechaNacimiento = this.value;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
        document.getElementById('edad_est').value = edad;
    });

    const form = document.querySelector('.registrar-matricula form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const isEditing = window.location.pathname.endsWith('/matriculas/editar');
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            const formData = new FormData(form);

            // Estado: si edición usar el valor fijo cargado, si creación tomar del form (input hidden name="estado")
            const estadoEstudiante = isEditing ? window.matriculaEstado : formData.get('estado');

            const estudiante = {
                nombre_est: formData.get('nombre_est'),
                apellido_est: formData.get('apellido_est'),
                dni_est: formData.get('dni_est'),
                fecha_nacimiento_est: formData.get('fecha_nacimiento_est'),
                estado_est: estadoEstudiante,
                titular_est: formData.get('titular_est'),
                convive_padres: formData.get('convive_padres'),
                genero: formData.get('genero'),
                discapacidad_est: formData.get('discapacidad_est'),
                detalles_disc_est: formData.get('detalles_disc_est'),
                descuentos_id_descuento: formData.get('descuento') || null
            };
            if (isEditing && window.estudianteId) estudiante.id = window.estudianteId;

            const responsables = [];
            responsables.push({
                nombre_resp: formData.get('nombre_padre'),
                apellido_resp: formData.get('apellido_padre'),
                dni_resp: formData.get('dni_padre'),
                direc_domic_resp: formData.get('direccion_domicilio_padre'),
                parentesco_resp: "padre",
                telefono_resp: formData.get('telefono_padre'),
                ocupacion_resp: formData.get('ocupacion_padre'),
                email_resp: formData.get('correo_padre'),
                observaciones_resp: formData.get('observaciones_padre'),
                tipo_vinculo: "padre"
            });
            responsables.push({
                nombre_resp: formData.get('nombre_madre'),
                apellido_resp: formData.get('apellido_madre'),
                dni_resp: formData.get('dni_madre'),
                direc_domic_resp: formData.get('direc_domic_madre'),
                parentesco_resp: "madre",
                telefono_resp: formData.get('telefono_madre'),
                ocupacion_resp: formData.get('ocupacion_madre'),
                email_resp: formData.get('email_madre'),
                observaciones_resp: formData.get('observaciones_madre'),
                tipo_vinculo: "madre"
            });
            if (document.querySelector('.datos-tutor').style.display === 'block') {
                responsables.push({
                    nombre_resp: formData.get('nombre_tutor'),
                    apellido_resp: formData.get('apellido_tutor'),
                    dni_resp: formData.get('dni_tutor'),
                    direc_domic_resp: formData.get('direccion_domicilio_tutor'),
                    parentesco_resp: "tutor",
                    telefono_resp: formData.get('telefono_tutor'),
                    ocupacion_resp: formData.get('ocupacion_tutor'),
                    email_resp: formData.get('correo_tutor'),
                    observaciones_resp: formData.get('observaciones_tutor'),
                    tipo_vinculo: "tutor"
                });
            }

            const matricula = {
                fecha_matricula: new Date().toISOString().slice(0, 19).replace('T', ' '),
                estado_matr: isEditing ? window.matriculaEstadoMatricula || 'Pendiente' : 'Pendiente',
                tipo_mat: formData.get('tip_mat'),
                periodos_id_periodo: formData.get('periodo'),
                usuarios_id_usuarios: 1,
                secciones_id_seccion: formData.get('para_seccion')
            };

            const url = isEditing ? `/api/matriculas/${id}` : '/api/matriculas';
            const method = isEditing ? 'PUT' : 'POST';

            fetchAuth(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estudiante, responsables, matricula })
            })
                .then(res => res.json())
                .then(result => {
                    if (result.matriculaId || result.message) {
                        alert(isEditing ? 'Matrícula actualizada correctamente' : 'Matrícula registrada correctamente');
                        window.location.href = '/secretario/matriculas';
                    } else {
                        alert(result.error || 'Error al procesar matrícula');
                    }
                });
        });
    }

    // Edición
    if (window.location.pathname.endsWith('/matriculas/editar')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const form = document.querySelector('.registrar-matricula form');

        fetchAuth(`/api/matriculas/${id}`)
            .then(res => res.json())
            .then(data => {
                const { matricula, responsables } = data;
                window.estudianteId = matricula.id_estudiante;

                // Estado del estudiante (no editable)
                window.matriculaEstado = matricula.estado_est || 'activo';
                const estadoVisual = document.getElementById('estado_matr_visual');
                const estadoHidden = document.getElementById('estado_matr_hidden');
                if (estadoVisual) {
                    estadoVisual.innerHTML = `<option value="${window.matriculaEstado}">${window.matriculaEstado}</option>`;
                }
                if (estadoHidden) {
                    estadoHidden.value = window.matriculaEstado;
                }

                // (Opcional) estado de la matrícula si también debes bloquearlo
                // window.matriculaEstadoMatricula = matricula.estado_matr || 'Pendiente';

                // Llenar estudiante
                form.querySelector('input[name="nombre_est"]').value = matricula.nombre_est;
                form.querySelector('input[name="apellido_est"]').value = matricula.apellido_est;
                form.querySelector('input[name="dni_est"]').value = matricula.dni_est;
                form.querySelector('input[name="fecha_nacimiento_est"]').value =
                    matricula.fecha_nacimiento_est ? matricula.fecha_nacimiento_est.split('T')[0] : '';
                form.querySelector('select[name="titular_est"]').value = matricula.titular_est;
                form.querySelector('select[name="genero"]').value = matricula.genero;
                form.querySelector('select[name="discapacidad_est"]').value = matricula.discapacidad_est;
                form.querySelector('select[name="convive_padres"]').value = matricula.convive_padres;
                form.querySelector('input[name="detalles_disc_est"]').value = matricula.detalles_disc_est || '';
                // Select original de estado si existe (dejar valor pero podría estar oculto)
                const originalEstadoSelect = form.querySelector('select[name="estado"]');
                if (originalEstadoSelect) {
                    originalEstadoSelect.value = window.matriculaEstado;
                    originalEstadoSelect.disabled = true;
                }

                // Responsables
                responsables.forEach(resp => {
                    if (resp.tipo_vinculo === 'padre') {
                        form.querySelector('input[name="nombre_padre"]').value = resp.nombre_resp || '';
                        form.querySelector('input[name="apellido_padre"]').value = resp.apellido_resp || '';
                        form.querySelector('input[name="dni_padre"]').value = resp.dni_resp || '';
                        form.querySelector('input[name="direccion_domicilio_padre"]').value = resp.direc_domic_resp || '';
                        form.querySelector('input[name="telefono_padre"]').value = resp.telefono_resp || '';
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

                // Cascada de selects
                if (matricula.id_anio_escolar) {
                    document.getElementById('anio_academico').value = matricula.id_anio_escolar;
                    document.getElementById('anio_academico').dispatchEvent(new Event('change'));
                    setTimeout(() => {
                        document.getElementById('periodo').value = matricula.id_periodo;
                    }, 300);
                }
                if (matricula.id_nivel) {
                    setTimeout(() => {
                        document.getElementById('para_nivel').value = matricula.id_nivel;
                        document.getElementById('para_nivel').dispatchEvent(new Event('change'));
                        setTimeout(() => {
                            document.getElementById('para_grado').value = matricula.id_grado;
                            document.getElementById('para_grado').dispatchEvent(new Event('change'));
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
// ...existing code...
function cargarMatriculas() {
    fetchAuth('/api/matriculas')
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
// ...existing code...