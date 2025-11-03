document.addEventListener('DOMContentLoaded', function () {
    // LISTA: /secretario/mensualidades
    if (window.location.pathname.endsWith('/mensualidades/meses')) {

        // Inicializa la tabla al cargar la página
        cargarMeses();

        // Delegación para eliminar
        document.body.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-eliminar-mes')) {
                const id = e.target.getAttribute('data-id');
                if (!id) return;
                if (confirm('¿Seguro que deseas eliminar esta mensualidad?')) {
                    fetch(`/api/mensualidades/${id}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(result => {
                            if (result && result.success) {
                                cargarMeses();
                            } else {
                                alert(result?.message || result?.error || 'Error al eliminar');
                            }
                        })
                        .catch(() => alert('Error de red'));
                }
            }
        });
    }

    // CREAR: /secretario/mensualidades/meses/crear
    if (window.location.pathname.endsWith('/mensualidades/meses/crear')) {
        const form = document.getElementById('form-crear-mes');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const mes = form.mes?.value?.trim();
                const fecha_limite = parseInt(form.fecha_limite?.value, 10);
                const descripcion_mes = form.descripcion_mes?.value?.trim() || '';
 
                if (!mes || isNaN(fecha_limite)) {
                    return alert('Mes y fecha límite son obligatorios');
                }
                if (fecha_limite < 1 || fecha_limite > 30) {
                    return alert('Fecha límite debe estar entre 1 y 30');
                }

                fetch('/api/mensualidades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mes, fecha_limite, descripcion_mes })
                })
                    .then(res => res.json())
                    .then(result => {
                        if (result && result.success) {
                            alert('Mensualidad creada');
                            window.location.href = '/admin/mensualidades';
                        } else {
                            alert(result?.message || result?.error || 'Error al crear');
                        }
                    })
                    .catch(() => alert('Error de red'));
            });
        }
    }

    // EDITAR: /secretario/mensualidades/meses/editar?id=...
    if (window.location.pathname.endsWith('/mensualidades/meses/editar')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const form = document.getElementById('form-editar-mes');
        if (!id || !form) return;

        // Cargar datos actuales
        fetch(`/api/mensualidades/${id}`)
            .then(res => res.json())
            .then(resp => {
                const datos = resp?.data || resp;
                if (!datos) return alert('No se encontró la mensualidad');
                form.mes.value = datos.mes || '';
                form.fecha_limite.value = datos.fecha_limite || '';
                form.descripcion_mes.value = datos.descripcion_mes || '';
            })
            .catch(() => alert('Error al cargar datos'));

        // Guardar cambios
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const mes = form.mes?.value?.trim();
            const fecha_limite = parseInt(form.fecha_limite?.value, 10);
            const descripcion_mes = form.descripcion_mes?.value?.trim() || '';

            if (!mes || isNaN(fecha_limite)) {
                return alert('Mes y fecha límite son obligatorios');
            }
            if (fecha_limite < 1 || fecha_limite > 30) {
                return alert('Fecha límite debe estar entre 1 y 30');
            }

            fetch(`/api/mensualidades/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mes, fecha_limite, descripcion_mes })
            })
                .then(res => res.json())
                .then(result => {
                    if (result && result.success) {
                        alert('Mensualidad actualizada');
                        window.location.href = '/admin/mensualidades';
                    } else {
                        alert(result?.message || result?.error || 'Error al actualizar');
                    }
                })
                .catch(() => alert('Error de red'));
        });
    }
});

// Función para cargar lista y renderizar tabla
function cargarMeses() {
    fetch('/api/mensualidades')
        .then(res => res.json())
        .then(resp => {
            const meses = resp?.data || resp || [];
            const tbody = document.querySelector('.tabla-lista-meses .tabla-detalles table tbody');
            if (!tbody) {
                console.warn('No se encontró tbody en la vista para renderizar meses.');
                return;
            }
            if (!meses.length) {
                tbody.innerHTML = '<tr><td colspan="4">No hay mensualidades registradas</td></tr>';
                return;
            }
            tbody.innerHTML = meses.map(m => {
            const fechaCreacion = m.fecha_creacion_mes ? String(m.fecha_creacion_mes).split('T')[0] : '';
            return `
                <tr data-id="${m.id_mes}">
                    <td>${escapeHtml(m.mes)}</td>
                    <td>${escapeHtml(String(m.fecha_limite))}</td>
                    <td>${escapeHtml(fechaCreacion)}</td>
                    <td>${escapeHtml(m.descripcion_mes || '')}</td>
                    <td>
                    <a href="/admin/mensualidades/meses/editar?id=${m.id_mes}"><button class="btn-editar-mes" data-id="${m.id_mes}">Editar</button></a>
                    <button class="btn-eliminar-mes" data-id="${m.id_mes}">Eliminar</button>
                    </td>
                </tr>
            `;
}).join('');
        })
        .catch(err => {
            console.error('Error cargando mensualidades:', err);
            const tbody = document.querySelector('.tabla-lista-meses .tabla-detalles table tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="4">Error al cargar mensualidades</td></tr>';
        });
}


// pequeño escape para evitar inyección al renderizar valores simples
function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}