import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', function () {
    cargarMontosDefinidos();
    cargarGrados();
    inicializarFormulario();
});

// Cargar montos definidos en la tabla
function cargarMontosDefinidos() {
    fetchAuth('/api/definir_monto')
        .then(res => res.json())
        .then(montos => {
            const tbody = document.getElementById('tabla-montos-list');
            if (!tbody) return;
            tbody.innerHTML = '';
            montos.forEach(monto => {
                tbody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td>${monto.tipo_est_mon}</td>
                        <td>S/ ${parseFloat(monto.monto_base).toFixed(2)}</td>
                        <td>${monto.descripcion}</td>
                        <td>${monto.grado_nombre || 'General'}</td>
                        <td>${monto.nivel_nombre || ''}</td>
                        <td>
                            <a href="/secretario/definir_monto/editar?id=${monto.id_estimar_monto}">
                                <button>Editar</button>
                            </a>
                            <button onclick="eliminarMonto(${monto.id_estimar_monto})">Eliminar</button>
                        </td>
                    </tr>
                `);
            });
        })
        .catch(error => {
            mostrarError('Error al cargar montos: ' + error.message);
        });
}

// Eliminar monto
function eliminarMonto(id) {
    if (confirm('¿Seguro que desea eliminar este monto?')) {
        fetchAuth(`/api/definir_monto/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
                alert(result.message || 'Monto eliminado');
                cargarMontosDefinidos();
            })
            .catch(error => {
                mostrarError('Error al eliminar el monto: ' + error.message);
            });
    }
}

// Cargar grados y niveles en el select
function cargarGrados() {
    fetchAuth('/api/grados')
        .then(res => res.json())
        .then(grados => {
            const select = document.getElementById('nivel_grado');
            if (!select) return;
            grados.forEach(grado => {
                select.insertAdjacentHTML('beforeend', `<option value="${grado.id_grado}">
                    ${grado.nombre_grad} (${grado.nombre_niv})
                </option>`);
            });
        });
}

// Inicializar formulario para crear o editar
function inicializarFormulario() {
    // Detecta el formulario presente (crear o editar)
    const form = document.getElementById('form-crear-monto') || document.getElementById('form-editar-monto');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id && form.id === 'form-editar-monto') {
        // Modo edición
        fetchAuth(`/api/definir_monto/${id}`)
            .then(res => res.json())
            .then(monto => {
                document.getElementById('tipo').value = monto.tipo_est_mon;
                document.getElementById('monto_base').value = monto.monto_base;
                document.getElementById('descripcion').value = monto.descripcion;
                document.getElementById('nivel_grado').value = monto.grados_id_grado || '';
            });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const datos = obtenerDatosFormulario();
            if (!validarDatos(datos)) return;
            fetchAuth(`/api/definir_monto/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            .then(res => res.json())
            .then(result => {
                alert(result.message || 'Monto actualizado');
                window.location.href = '/secretario/definir_monto';
            })
            .catch(error => {
                mostrarError('Error al actualizar el monto: ' + error.message);
            });
        });
    } else {
        // Modo creación
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const datos = obtenerDatosFormulario();
            if (!validarDatos(datos)) return;
            fetchAuth('/api/definir_monto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            .then(res => res.json())
            .then(result => {
                alert(result.message || 'Monto creado');
                window.location.href = '/secretario/definir_monto';
            })
            .catch(error => {
                mostrarError('Error al crear el monto: ' + error.message);
            });
        });
    }
}

// Obtener datos del formulario
function obtenerDatosFormulario() {
    return {
        tipo_est_mon: document.getElementById('tipo').value,
        monto_base: parseFloat(document.getElementById('monto_base').value),
        descripcion: document.getElementById('descripcion').value,
        grados_id_grado: document.getElementById('nivel_grado').value || null
    };
}

// Validar datos antes de enviar
function validarDatos(datos) {
    if (!datos.tipo_est_mon) {
        mostrarError('Seleccione el tipo de monto.');
        return false;
    }
    if (isNaN(datos.monto_base) || datos.monto_base <= 0) {
        mostrarError('Ingrese un monto válido.');
        return false;
    }
    return true;
}

// Mostrar errores en el frontend
function mostrarError(msg) {
    alert(msg); // Puedes mejorar esto mostrando el error en el DOM
}