(function () {
  const API_BASE = '/api/pagos';

  async function requestJson(url, opts = {}) {
    const res = await fetch(url, opts);
    const text = await res.text();
    try { return res.ok ? JSON.parse(text || '[]') : Promise.reject(new Error(text || res.statusText)); }
    catch (e) { return res.ok ? [] : Promise.reject(new Error(text || res.statusText)); }
  }

  async function obtenerMontosMatricula(nivelId = null, gradoId = null) {
    const qs = new URLSearchParams();
    if (nivelId) qs.set('nivelId', nivelId);
    if (gradoId) qs.set('gradoId', gradoId);
    return await requestJson(`${API_BASE}/montos-matricula?${qs.toString()}`);
  }

  async function populateMontosSelect(nivelId = null, gradoId = null, selectSelector = '#monto_estimado') {
    const select = document.querySelector(selectSelector);
    if (!select) return;
    select.innerHTML = '';
    try {
      const montos = await obtenerMontosMatricula(nivelId, gradoId);
      if (!montos || montos.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No hay montos definidos';
        select.appendChild(opt);
        return;
      }
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'Seleccione monto estimado';
      select.appendChild(empty);

      montos.forEach(m => {
        const opt = document.createElement('option');
        const id = m.id_estimar_monto || m.id || '';
        opt.value = id;
        // guardar monto_base disponible para cálculo en data attribute
        const montoBase = (m.monto_base !== undefined && m.monto_base !== null) ? Number(m.monto_base) : null;
        if (montoBase !== null) opt.dataset.monto = String(montoBase);
        const descripcion = m.descripcion || '';
        const montoTxt = montoBase !== null ? Number(montoBase).toFixed(2) : '';
        const gradoNombre = m.nombre_grad ? ` - ${m.nombre_grad}` : '';
        opt.textContent = `${descripcion}${gradoNombre} ${montoTxt ? ('- S/ ' + montoTxt) : ''}`.trim();
        select.appendChild(opt);
      });
    } catch (err) {
      console.error('Error cargar montos:', err);
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Error cargando montos';
      select.appendChild(opt);
    }
  }
  function aplicarDescuentoYMostrar(descuentoPct = 0, montoBase = 0) {
    const descuentoEl = document.getElementById('descuento_aplicado');
    const montoFinalEl = document.getElementById('monto_final');
    if (descuentoEl) descuentoEl.value = descuentoPct ? `${Number(descuentoPct).toFixed(2)} %` : '';
    const montoFinal = Number(montoBase) * (1 - (Number(descuentoPct || 0) / 100));
    if (montoFinalEl) montoFinalEl.value = isNaN(montoFinal) ? '' : Number(montoFinal).toFixed(2);
  }

    async function crearPago(payload = {}, file = null) {
    try {
      if (file) {
        const fd = new FormData();
        Object.keys(payload).forEach(k => {
          const v = payload[k];
          if (v !== undefined && v !== null) fd.append(k, v);
        });
        fd.append('comprobante', file);

        const res = await fetch(`${API_BASE}/crear`, { method: 'POST', body: fd });
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        return JSON.parse(text || '{}');
      } else {
        const res = await fetch(`${API_BASE}/crear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        return JSON.parse(text || '{}');
      }
    } catch (err) {
      console.error('crearPago error:', err);
      throw err;
    }
  }

  // Carga matrículas (filtro pendientes) y renderiza en la tabla .matriculas-pendientes-list
  async function cargarMatriculasPendientes(tableBodySelector = '.matriculas-pendientes-list') {
    const tbody = document.querySelector(tableBodySelector);
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';
    try {
      const res = await fetch('/api/matriculas');
      const matriculas = await res.json();
      tbody.innerHTML = '';
      (matriculas || []).forEach(m => {
        const estado = String(m.estado_matr || m.estado_mat || '').trim().toLowerCase();
        if (estado !== 'pendiente') return;
        const id = m.id_matricula || m.id || m.id_matricula;
        const nombreEst = m.estudiante_nombre || m.nombre_estudiante || m.nombre_completo || `${m.nombre_est || ''} ${m.apellido || ''}`.trim() || '';
        const titular_est = m.titular_est || m.nombre_titular || m.tutor || '';
        const tipo = m.tipo_mat || m.tipo_matricula || '';
        const seccion = m.nombre_seccion || m.seccion || '';
        const grado = m.nombre_grad || m.grado || '';
        const nivel = m.nombre_nivel || m.nivel || '';
        const dni = m.dni_est || m.dni || '';
        const fecha = m.fecha_matricula || m.fecha || '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${id}</td>
          <td>${nombreEst}</td>
          <td>${titular_est}</td>
          <td>${tipo}</td>
          <td>${m.estado_matr || m.estado_mat || ''}</td>
          <td>${dni}</td>
          <td>${fecha.split('T')[0]}</td>
          <td>${m.nombre_usuario || m.ingresado_por || ''}</td>
          <td>${m.nombre_niv}</td>
          <td>${m.nombre_grad}</td>
          <td>${m.seccion_nombre}</td>
          <td><button type="button" class="btn-seleccionar" data-id="${id}">Seleccionar</button></td>
        `;
        // attach raw data to row for later retrieval
        tr.dataset.raw = JSON.stringify(m);
        tbody.appendChild(tr);
      });

      // bind buttons
      tbody.querySelectorAll('.btn-seleccionar').forEach(b => b.addEventListener('click', onSeleccionarMatricula));
      if (!tbody.querySelectorAll('.btn-seleccionar').length) {
        tbody.innerHTML = '<tr><td colspan="9">No hay matrículas pendientes</td></tr>';
      }
    } catch (err) {
      console.error('Error cargando matriculas:', err);
      tbody.innerHTML = '<tr><td colspan="9">Error cargando matrículas</td></tr>';
    }
  }

  // Maneja la selección de una matrícula: rellena input[name="estudiante"] y popula montos
  async function onSeleccionarMatricula(e) {
    const btn = e.currentTarget;
    const tr = btn.closest('tr');
    if (!tr) return;
    const raw = tr.dataset.raw ? JSON.parse(tr.dataset.raw) : null;
    const m = raw || {};
    const id = btn.dataset.id;
    // hidden input
    let hid = document.getElementById('matricula_id');
    if (!hid) {
      hid = document.createElement('input');
      hid.type = 'hidden';
      hid.id = 'matricula_id';
      hid.name = 'matricula_id';
      const form = document.querySelector('.datos-pago form') || document.querySelector('form');
      if (form) form.appendChild(hid);
    }
    hid.value = id;

    // fill student input
    const estudianteInp = document.querySelector('input[name="estudiante"]');
    const nombreEst = m.estudiante_nombre || m.nombre_estudiante || m.nombre_completo || `${m.nombre_est || ''} ${m.apellido || ''}`.trim() || '';
    if (estudianteInp) estudianteInp.value = nombreEst;

    // nivel/grado
    let nivelId = m.niveles_id_nivel || m.nivel_id || m.niveles_id || null;
    let gradoId = m.grados_id_grado || m.grado_id || null;

    // intentar obtener detalle si faltan ids y endpoint existe
    if (!nivelId || !gradoId) {
      try {
        const info = await requestJson(`${API_BASE}/matricula/info/${encodeURIComponent(id)}`);
        if (info) {
          nivelId = nivelId || info.nivel_id || null;
          gradoId = gradoId || info.grado_id || null;
          // si backend devuelve descuento, guardarlo en data del row para uso posterior
          if (typeof info.descuento_porcentaje !== 'undefined') {
            tr.dataset.descuento = String(info.descuento_porcentaje || 0);
          }
        }
      } catch (err) {
        console.warn('No se pudo obtener detalle de matrícula:', err);
      }
    }

    // poblar montos
    await populateMontosSelect(nivelId, gradoId, '#monto_estimado');

    // si la fila tiene descuento, aplicarlo; si no, intentar obtener desde dataset
    const descuentoFila = tr.dataset.descuento ? Number(tr.dataset.descuento) : 0;

    // si el select contiene una opción seleccionada por defecto (estimarId), elegirla y aplicar su monto
    const estimarId = m.estimar_monto_id_estimar_monto || m.estimar_id || m.id_estimar_monto || null;
    const sel = document.querySelector('#monto_estimado');
    if (sel) {
      if (estimarId) sel.value = String(estimarId);
      // obtener monto base desde la opción seleccionada
      const opt = sel.options[sel.selectedIndex];
      const montoBase = opt && opt.dataset && opt.dataset.monto ? Number(opt.dataset.monto) : (m.monto_base || 0);
      aplicarDescuentoYMostrar(descuentoFila, montoBase);
      // escuchar cambios en select para actualizar monto y cálculo
      sel.addEventListener('change', () => {
        const opt2 = sel.options[sel.selectedIndex];
        const mb = opt2 && opt2.dataset && opt2.dataset.monto ? Number(opt2.dataset.monto) : 0;
        // set monto input to monto base when user selects estimated monto
        const montoInp = document.querySelector('input[name="monto"]') || document.getElementById('monto');
        if (montoInp) montoInp.value = mb ? Number(mb).toFixed(2) : '';
        aplicarDescuentoYMostrar(descuentoFila, mb);
      });
    }

    // tambien escuchar cambios manuales en monto para recalcular monto final
    const montoInpManual = document.querySelector('input[name="monto"]') || document.getElementById('monto');
    if (montoInpManual) {
      montoInpManual.addEventListener('input', () => {
        const mb = Number(montoInpManual.value || 0);
        aplicarDescuentoYMostrar(descuentoFila, mb);
      });
    }
  }

  // Auto-init cuando la página contiene la tabla de pendientes o el select monto_estimado
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.pago-mensual').style.display = 'none';
    document.getElementById('tipo_pago').addEventListener('change', function () {
        document.querySelector('.pago-mensual').style.display = this.value === 'Mensualidad' ? 'block' : 'none';
    });
    if (document.querySelector('.matriculas-pendientes-list')) {
      cargarMatriculasPendientes();
    }
    // también inicializar montos si hay selects nivel/grado ya en la página (compatibilidad)
    const nivelEl = document.getElementById('para_nivel') || document.getElementById('nivel');
    const gradoEl = document.getElementById('para_grado') || document.getElementById('grado');
    if (document.querySelector('#monto_estimado')) {
      const n = nivelEl ? nivelEl.value || null : null;
      const g = gradoEl ? gradoEl.value || null : null;
      populateMontosSelect(n, g, '#monto_estimado');
    }
    const pagoForm = document.querySelector('.formulario-pagos form') || document.querySelector('form');
    if (pagoForm) {
      pagoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          // recoger valores del form
          const f = e.target;
          const tipo_pago = f.tipo_pago ? f.tipo_pago.value : null;
          const monto = f.monto ? Number(f.monto.value || 0) : 0;
          const metodo_pago = f.metodo_pago ? f.metodo_pago.value : null;
          const descripcion = f.descripcion ? f.descripcion.value : null;
          // campo select id="monto_estimado" contiene id_estimar_monto
          const estimar_id = f.monto_estimado ? (f.monto_estimado.value || null) : null;
          // hidden matricula_id puede existir (agregado al seleccionar matrícula)
          const matricula_id = f.matricula_id ? (f.matricula_id.value || null) : null;
          // file comprobante
          const fileInput = f.querySelector('input[name="comprobante"]');
          const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

          const payload = {
            tipo_pago,
            monto,
            metodo_pago,
            descripcion,
            estimar_monto_id_estimar_monto: estimar_id ? Number(estimar_id) : null,
            matricula_id: matricula_id ? Number(matricula_id) : null,
            usuarios_id_usuarios: 1 // ajustar según sesión/usuario real
          };

          // llamar crearPago (si file presente, se enviará multipart)
          const resp = await crearPago(payload, file);
          console.log('crearPago resp', resp);
          alert('Pago registrado correctamente.');

          // limpiar y refrescar
          pagoForm.reset();
          // limpiar hidden matricula si existía
          const hid = document.getElementById('matricula_id');
          if (hid) hid.remove();
          // recargar lista de matrículas pendientes si existe
          if (typeof cargarMatriculasPendientes === 'function') cargarMatriculasPendientes();
          // recargar select de montos
          populateMontosSelect(null, null, '#monto_estimado');
        } catch (err) {
          console.error('Error en submit crearPago:', err);
          alert('Error al registrar pago: ' + (err.message || err));
        }
      });
    }
  });

  window.apiPagos = {
    obtenerMontosMatricula,
    populateMontosSelect,
    crearPago,
    cargarMatriculasPendientes
  };
})();