import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

(function () {
  const API_BASE = '/api/pagos';

  async function requestJson(url, opts = {}) {
    const res = await fetchAuth(url, opts);
    const text = await res.text();
    try { return res.ok ? JSON.parse(text || '[]') : Promise.reject(new Error(text || res.statusText)); }
    catch (e) { return res.ok ? [] : Promise.reject(new Error(text || res.statusText)); }
  }

  function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;',
      '=': '&#61;',
      '/': '&#47;'
    })[s];
  });
}

  async function obtenerMontosMatricula(nivelId = null, gradoId = null) {
    const qs = new URLSearchParams();
    if (nivelId) qs.set('nivelId', nivelId);
    if (gradoId) qs.set('gradoId', gradoId);
    return await requestJson(`${API_BASE}/montos-matricula?${qs.toString()}`);
  }

  async function populateMontosSelect(nivelId = null, gradoId = null, selectSelector = '#monto_estimado', tipoPago = null) {
    let select = document.querySelector(selectSelector);
    if (!select) return;

    const parent = select.parentNode;
    const cloned = select.cloneNode(false);
    parent.replaceChild(cloned, select);
    select = cloned;

    select.innerHTML = '';

    try {
      const tipo = tipoPago || (document.getElementById('tipo_pago') ? document.getElementById('tipo_pago').value : 'Matricula');

      let montos = [];
      if (String(tipo || '').toLowerCase() === 'mensualidad') {
        const qs = new URLSearchParams();
        qs.set('tipo', 'mensualidad');
        if (nivelId) qs.set('nivelId', nivelId);
        if (gradoId) qs.set('gradoId', gradoId);
        const res = await fetchAuth(`/api/definir_monto?${qs.toString()}`);
        if (!res.ok) throw new Error('Error cargando montos de mensualidad');
        montos = await res.json();
      } else {
        montos = await obtenerMontosMatricula(nivelId, gradoId);
      }

      if (!montos || montos.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No hay montos definidos';
        select.appendChild(opt);
        const montoInpEmpty = document.getElementById('monto') || document.querySelector('input[name="monto"]');
        if (montoInpEmpty) montoInpEmpty.value = '';
        return;
      }

      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'Seleccione monto estimado';
      select.appendChild(empty);

      const seen = new Set();
      montos.forEach(m => {
        const id = String(m.id_estimar_monto || m.id || '');
        if (!id || seen.has(id)) return;
        seen.add(id);

        const opt = document.createElement('option');
        opt.value = id;
        const montoBase = (m.monto_base !== undefined && m.monto_base !== null) ? Number(m.monto_base) : null;
        if (montoBase !== null) opt.dataset.monto = String(montoBase);
        const descripcion = m.descripcion || '';
        const montoTxt = montoBase !== null ? Number(montoBase).toFixed(2) : '';
        const gradoNombre = m.nombre_grad ? ` - ${m.nombre_grad}` : '';
        opt.textContent = `${descripcion}${gradoNombre} ${montoTxt ? ('- S/ ' + montoTxt) : ''}`.trim();
        select.appendChild(opt);
      });

      // definir referencia al input de monto esperado
      const montoInp = document.getElementById('monto') || document.querySelector('input[name="monto"]');

      const changeHandler = function () {
  const opt = this.options[this.selectedIndex] || null;
  const montoBase = opt?.dataset?.monto ? Number(opt.dataset.monto) : '';
  if (montoInp) {
    montoInp.value = (montoBase === '' || Number.isNaN(montoBase)) ? '' : Number(montoBase).toFixed(2);
  }
  actualizarEstadoPago();
};

      select.addEventListener('change', changeHandler);

      // seleccionar automáticamente la primera opción válida
      const firstValid = Array.from(select.options).find(o => o.value);
      if (firstValid) {
        select.value = firstValid.value;
        changeHandler.call(select);
      }
    } catch (err) {
      console.error('Error cargar montos:', err);
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Error cargando montos';
      select.appendChild(opt);
    }
  }
  
function aplicarDescuentoYMostrar(descuentoPct = 0, montoBase = 0, descuentoAplicable = true) {
  const tipoActual = (document.getElementById('tipo_pago')?.value || '').toLowerCase();
  const descuentoEl = document.getElementById('descuento_aplicado');
  const montoFinalEl = document.getElementById('monto_final');
  const montoInp = document.getElementById('monto') || document.querySelector('input[name="monto"]');

  // Forzar no descuento para matrícula
  if (tipoActual === 'matricula') {
    descuentoPct = 0;
    descuentoAplicable = false;
  }

  if (montoInp) {
    if (!isNaN(Number(montoBase))) montoInp.value = Number(montoBase).toFixed(2);
    else montoInp.value = '';
  }

  if (descuentoEl) {
    if (tipoActual === 'matricula') {
      descuentoEl.value = '';            // Limpio
      descuentoEl.dataset.pct = '0';
      descuentoEl.dataset.aplicable = '0';
    } else if (!descuentoAplicable) {
      descuentoEl.value = 'No aplicable (pasó la fecha límite)';
      descuentoEl.dataset.pct = String(descuentoPct || 0);
      descuentoEl.dataset.aplicable = '0';
    } else if (descuentoPct) {
      descuentoEl.value = Number(descuentoPct).toFixed(2) + ' %';
      descuentoEl.dataset.pct = String(descuentoPct);
      descuentoEl.dataset.aplicable = '1';
    } else {
      descuentoEl.value = '';
      descuentoEl.dataset.pct = '0';
      descuentoEl.dataset.aplicable = '0';
    }
  }

  let montoFinal = Number(montoBase || 0);
  if (descuentoAplicable && descuentoPct) {
    montoFinal = montoFinal * (1 - (Number(descuentoPct) / 100));
  }
  if (tipoActual === 'matricula') {
    montoFinal = Number(montoBase || 0); // sin descuento
  }

  if (montoFinalEl) {
    montoFinalEl.value = isNaN(montoFinal) ? '' : montoFinal.toFixed(2);
  }
  actualizarEstadoPago();
}

function actualizarEstadoPago() {
  const estimado = Number(document.querySelector('input[name="monto"]')?.value || 0);
  const recibido = Number(document.querySelector('input[name="monto_recibido"]')?.value || 0);
  const estadoEl = document.getElementById('estado_pago_display');
  if (!estadoEl) return;
  if (!estimado) { estadoEl.value = ''; return; }
  estadoEl.value = recibido >= estimado ? 'Completo' : 'Incompleto';
}
document.querySelector('input[name="monto_recibido"]')?.addEventListener('input', actualizarEstadoPago);


function sincronizarMontoFinal() {
  const rec = document.querySelector('input[name="monto_recibido"]');
  const finalEl = document.getElementById('monto_final');
  if (rec && finalEl) {
    finalEl.value = rec.value ? Number(rec.value).toFixed(2) : '';
  }
  actualizarEstadoPago();
}

function onCambioMontoEstimado() {
  const sel = document.getElementById('monto_estimado');
  const montoInp = document.querySelector('input[name="monto"]');
  if (!sel || !montoInp) return;
  const opt = sel.options[sel.selectedIndex];
  const base = opt?.dataset?.monto ? Number(opt.dataset.monto) : '';
  montoInp.value = (base === '' || isNaN(base)) ? '' : base.toFixed(2);
  actualizarEstadoPago();
}

document.getElementById('monto_estimado')?.addEventListener('change', onCambioMontoEstimado);

// Listener para monto recibido
document.querySelector('input[name="monto_recibido"]')?.addEventListener('input', sincronizarMontoFinal);



async function crearPago(payload = {}, file = null) {
    try {
      if (file) {
        const fd = new FormData();
        Object.keys(payload).forEach(k => {
          const v = payload[k];
          if (v !== undefined && v !== null) fd.append(k, v);
        });
        fd.append('comprobante', file);

        const res = await fetchAuth(`${API_BASE}/crear`, { method: 'POST', body: fd });
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        return JSON.parse(text || '{}');
      } else {
        const res = await fetchAuth(`${API_BASE}/crear`, {
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

  document.addEventListener('input', (e) => {
  if (e.target.id === 'monto_final' || e.target.id === 'monto') actualizarEstadoPago();
});

function recalcularMontoFinal() {
  const tipo = (document.getElementById('tipo_pago')?.value || '').toLowerCase();
  const base = Number(document.getElementById('monto')?.value || 0);
  // No descuento para matrícula
  let descuentoPct = 0;
  let aplicable = false;
  if (tipo === 'mensualidad') {
    const descEl = document.getElementById('descuento_aplicado');
    if (descEl && descEl.dataset.pct && descEl.dataset.aplicable === '1') {
      descuentoPct = Number(descEl.dataset.pct);
      aplicable = true;
    }
  }
  let final = base;
  if (aplicable && descuentoPct > 0) {
    final = base * (1 - descuentoPct / 100);
  }
  const finalEl = document.getElementById('monto_final');
  if (finalEl) finalEl.value = base ? final.toFixed(2) : '';
  actualizarEstadoPago();
}

document.addEventListener('input', (e) => {
  if (e.target.id === 'monto_recibido') actualizarEstadoPago();
});

document.getElementById('tipo_pago')?.addEventListener('change', () => {
  // limpiar descuento al cambiar a matrícula
  if ((document.getElementById('tipo_pago').value || '').toLowerCase() === 'matricula') {
    const descEl = document.getElementById('descuento_aplicado');
    if (descEl) {
      descEl.value = '';
      descEl.dataset.pct = '0';
      descEl.dataset.aplicable = '0';
    }
    recalcularMontoFinal();
  }
});


  // CARGA TODOS LOS REGISTROS DE MENSUALIDADES REGISTRADAS
 async function cargarMensualidadesRegistradas(selectSelector = '#mes_a_pagar') {
    const sel = document.querySelector(selectSelector);
    if (!sel) return;
    sel.innerHTML = '';
    try {
      const res = await fetchAuth(`${API_BASE}/mensualidades-registradas`);
      if (!res.ok) throw new Error('Error cargando mensualidades registradas');
      const meses = await res.json();
      if (!Array.isArray(meses) || meses.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No hay mensualidades registradas';
        sel.appendChild(opt);
        return;
      }
      // añadir opción vacía
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'Seleccione mes a pagar';
      sel.appendChild(empty);
      // ordenar por mes si vienen desordenados (opcional): intentar usar orden calendario
      const orden = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      meses
        .map(m => ({ ...m, mes_norm: String(m.mes || '').toLowerCase().trim() }))
        .sort((a,b) => orden.indexOf(a.mes_norm) - orden.indexOf(b.mes_norm))
        .forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.id_mes;
          opt.textContent = `${m.mes} ${m.fecha_limite ? '(venc: día ' + m.fecha_limite + ')' : ''}`;
          sel.appendChild(opt);
        });
    } catch (err) {
      console.error('Error cargarMensualidadesRegistradas:', err);
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Error cargando meses';
      sel.appendChild(opt);
    }
  }

  // Carga matrículas (filtro pendientes) y renderiza en la tabla .matriculas-pendientes-list
  async function cargarMatriculasPendientes(tableBodySelector = '.matriculas-pendientes-list') {
    const tbody = document.querySelector(tableBodySelector);
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';
    try {
      const res = await fetchAuth('/api/matriculas');
      const matriculas = await res.json();
      tbody.innerHTML = '';
      (matriculas || []).forEach(m => {
        const estado = String(m.estado_matr || m.estado_mat || '').trim().toLowerCase();
        if (estado !== 'pendiente') return;
        const id = m.id_matricula || m.id || m.id_matricula;
        // const nombreEst = m.estudiante_nombre || m.nombre_estudiante || m.nombre_completo || `${m.nombre_est || ''} ${m.apellido || ''}`.trim() || '';
        // const titular_est = m.titular_est || m.nombre_titular || m.tutor || '';
        // const tipo = m.tipo_mat || m.tipo_matricula || '';
        // const seccion = m.nombre_seccion || m.seccion || '';
        // const grado = m.nombre_grad || m.grado || '';
        // const nivel = m.nombre_nivel || m.nivel || '';
        // const dni = m.dni_est || m.dni || '';
        // const fecha = m.fecha_matricula || m.fecha || '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${m.id_matricula}</td>
          <td>${m.nombre_est}</td>
          <td>${m.titular_est}</td>
          <td>${m.tipo_mat}</td>
          <td>${m.estado_matr || m.estado_mat || ''}</td>
          <td>${m.dni_est }</td>
          <td>${m.fecha_matricula.split('T')[0]}</td>
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

  // Función para cargar lista y renderizar mensualidades pendientes
   async function cargarMensualidadesPendientes(tableBodySelector = '.mensualidades-pendientes-list') {
    const tbody = document.querySelector(tableBodySelector);
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="11">Cargando...</td></tr>';
    try {
      const res = await fetchAuth(`${API_BASE}/mensualidades-pendientes`);
      if (!res.ok) throw new Error('Error cargando mensualidades pendientes');
      const lista = await res.json();
      if (!Array.isArray(lista) || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11">No hay mensualidades pendientes</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      lista.forEach(item => {
        const ultimoPago = item.ultimo_pago ? String(item.ultimo_pago) : 'Nunca';
        const descuentoTxt = item.descuento_aplicable ? `${Number(item.descuento_porcentaje).toFixed(2)} %` : 'Sin descuento';
        const vencimientoTxt = item.vencimiento_dia ? `día ${item.vencimiento_dia}` : '';
        const disabled = !item.pago_pendiente_id_mes ? 'disabled' : '';
        const titleBtn = item.pago_pendiente_id_mes ? 'Seleccionar' : 'No hay mensualidad siguiente registrada';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(item.nombre_est || '')} ${escapeHtml(item.apellido_est || '')}</td>
          <td>${escapeHtml(item.dni_est || '')}</td>
          <td>${item.fecha_matricula ? String(item.fecha_matricula).split('T')[0] : ''}</td>
          <td>${escapeHtml(item.nivel || '')}</td>
          <td>${escapeHtml(item.grado || '')}</td>
          <td>${escapeHtml(item.seccion || '')}</td>
          <td>${escapeHtml(ultimoPago)}</td>
          <td>${escapeHtml(item.pago_pendiente_mes || '')}</td>
          <td>${escapeHtml(vencimientoTxt)}</td>
          <td>${escapeHtml(descuentoTxt)}</td>
          <td><button class="btn-seleccionar-mensual" data-id="${item.id_matricula}" data-desc="${item.descuento_porcentaje || 0}" data-desc-aplic="${item.descuento_aplicable ? 1 : 0}" data-mesid="${item.pago_pendiente_id_mes || ''}" ${disabled} title="${escapeHtml(titleBtn)}">${escapeHtml(titleBtn)}</button></td>
        `;
        // attach raw for convenience
        tr.dataset.raw = JSON.stringify(item);
        // also expose descuento in dataset for selection (porcentaje y aplicabilidad)
        tr.dataset.descuento = String(item.descuento_porcentaje || 0);
        tr.dataset.descuentoAplicable = item.descuento_aplicable ? '1' : '0';
        tbody.appendChild(tr);
      });

      // bind seleccionar buttons
       tbody.querySelectorAll('.btn-seleccionar-mensual').forEach(b => {
        b.addEventListener('click', async function (e) {
          const id = this.dataset.id;
          const raw = this.closest('tr').dataset.raw ? JSON.parse(this.closest('tr').dataset.raw) : null;
          const mesId = this.dataset.mesid || null;
          const descuentoPct = this.dataset.desc || 0;
          const descuentoAplicable = this.dataset.descAplic === '1' || this.dataset.descAplic === 'true' || this.dataset.descAplic === '1';
          // llenar formulario similar a onSeleccionarMatricula
          const f = document.querySelector('.formulario-pagos form') || document.querySelector('form');
          if (f) {
            // hidden matricula_id
            let hid = document.getElementById('matricula_id');
            if (!hid) {
              hid = document.createElement('input');
              hid.type = 'hidden';
              hid.id = 'matricula_id';
              hid.name = 'matricula_id';
              f.appendChild(hid);
            }
            hid.value = id;
            // estudiante input
            const estudianteInp = document.querySelector('input[name="estudiante"]');
            if (estudianteInp) estudianteInp.value = `${raw.nombre_est || ''} ${raw.apellido_est || ''}`.trim();

            // rellenar nivel/grado/seccion visibles e hidden ids si vienen en raw
            const nivelNombre = raw.nombre_niv || raw.nivel || raw.nivel_nombre || '';
            const gradoNombre = raw.nombre_grad || raw.grado || raw.grado_nombre || '';
            const seccionNombre = raw.seccion_nombre || raw.seccion || raw.nombre_seccion || '';
            const nivelInp = document.querySelector('input[name="nivel"]');
            const gradoInp = document.querySelector('input[name="grado"]');
            const seccionInp = document.querySelector('input[name="seccion"]');
            if (nivelInp) nivelInp.value = nivelNombre;
            if (gradoInp) gradoInp.value = gradoNombre;
            if (seccionInp) seccionInp.value = seccionNombre;
            // hidden ids
            if (raw.niveles_id_nivel) {
              let hn = document.getElementById('nivel_id');
              if (!hn) { hn = document.createElement('input'); hn.type = 'hidden'; hn.id = 'nivel_id'; hn.name = 'nivel_id'; f.appendChild(hn); }
              hn.value = raw.niveles_id_nivel;
            }
            if (raw.grados_id_grado) {
              let hg = document.getElementById('grado_id');
              if (!hg) { hg = document.createElement('input'); hg.type = 'hidden'; hg.id = 'grado_id'; hg.name = 'grado_id'; f.appendChild(hg); }
              hg.value = raw.grados_id_grado;
            }
            if (raw.secciones_id_seccion) {
              let hs = document.getElementById('seccion_id');
              if (!hs) { hs = document.createElement('input'); hs.type = 'hidden'; hs.id = 'seccion_id'; hs.name = 'seccion_id'; f.appendChild(hs); }
              hs.value = raw.secciones_id_seccion;
            }

            // asegurar que el formulario esté en tipo 'Mensualidad'
            const tipoSel = document.getElementById('tipo_pago');
            if (tipoSel) {
              tipoSel.value = 'Mensualidad';
              tipoSel.dispatchEvent(new Event('change'));
            }

            // poblar montos por nivel/grado indicando tipoPago 'Mensualidad'
            const nivelId = raw.niveles_id_nivel || raw.nivel_id || null;
            const gradoId = raw.grados_id_grado || raw.grado_id || null;
            await populateMontosSelect(nivelId, gradoId, '#monto_estimado', 'Mensualidad');

            // obtener monto estimado seleccionado (si hay) y aplicar descuento (o mostrar no aplicable)
            const sel = document.querySelector('#monto_estimado');
            let montoBase = 0;
            if (sel) {
              // preferir la opción seleccionada, si no tomar la primera válida
              const optSel = sel.options[sel.selectedIndex] || Array.from(sel.options).find(o => o.value) || null;
              montoBase = optSel && optSel.dataset && optSel.dataset.monto ? Number(optSel.dataset.monto) : 0;
            }
            aplicarDescuentoYMostrar(Number(descuentoPct || 0), montoBase, !!Number(this.dataset.descAplic));

            // set mes_a_pagar select to the suggested next mes (if available)
            const mesSel = document.querySelector('#mes_a_pagar');
            if (mesSel) {
              if (mesId) {
                mesSel.value = String(mesId);
              } else {
                mesSel.value = '';
              }
            }
          }
        });
      });

    } catch (err) {
      console.error('Error cargando mensualidades pendientes:', err);
      tbody.innerHTML = '<tr><td colspan="11">Error cargando mensualidades</td></tr>';
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
    let seccionId = m.secciones_id_seccion || m.seccion_id || null;

    // intentar obtener detalle si faltan ids y endpoint existe
    let info = null;
    if (!nivelId || !gradoId || !seccionId) {
      try {
        info = await requestJson(`${API_BASE}/matricula/info/${encodeURIComponent(id)}`);
        if (info) {
          nivelId = nivelId || info.nivel_id || null;
          gradoId = gradoId || info.grado_id || null;
          seccionId = seccionId || info.seccion_id || null;
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

    // rellenar inputs visibles de nivel/grado/seccion con nombres disponibles
    const nivelTxt = (m.nombre_niv || m.nombre_nivel || (info && info.nivel_nombre) || '') ;
    const gradoTxt = (m.nombre_grad || m.grado || (info && info.grado_nombre) || '');
    const seccionTxt = (m.seccion_nombre || m.seccion || (info && info.seccion_nombre) || '');
    const nivelInp = document.querySelector('input[name="nivel"]');
    const gradoInp = document.querySelector('input[name="grado"]');
    const seccionInp = document.querySelector('input[name="seccion"]');
    if (nivelInp) nivelInp.value = nivelTxt || '';
    if (gradoInp) gradoInp.value = gradoTxt || '';
    if (seccionInp) seccionInp.value = seccionTxt || '';

    // crear/actualizar hidden inputs con ids para posibles usos posteriores
    function ensureHiddenId(idName, idValue) {
      if (!idValue && idValue !== 0) return;
      let el = document.getElementById(idName);
      if (!el) {
        el = document.createElement('input');
        el.type = 'hidden';
        el.id = idName;
        el.name = idName;
        const form = document.querySelector('.datos-pago form') || document.querySelector('form');
        if (form) form.appendChild(el);
      }
      el.value = idValue;
    }
    ensureHiddenId('nivel_id', nivelId);
    ensureHiddenId('grado_id', gradoId);
    ensureHiddenId('seccion_id', seccionId);

    // si la fila tiene descuento, aplicarlo; si no, intentar obtener desde dataset
    const descuentoFila = tr.dataset.descuento ? Number(tr.dataset.descuento) : 0;
    const descuentoAplicableFila = tr.dataset.descuentoAplicable ? (tr.dataset.descuentoAplicable === '1') : true;

    // si el select contiene una opción seleccionada por defecto (estimarId), elegirla y aplicar su monto
    const estimarId = m.estimar_monto_id_estimar_monto || m.estimar_id || m.id_estimar_monto || null;
    const sel = document.querySelector('#monto_estimado');
    if (sel) {
      if (estimarId) sel.value = String(estimarId);
  const opt = sel.options[sel.selectedIndex];
  const montoBase = opt && opt.dataset && opt.dataset.monto ? Number(opt.dataset.monto) : 0;
  const montoInp = document.querySelector('input[name="monto"]');
  if (montoInp) montoInp.value = montoBase ? montoBase.toFixed(2) : '';
  actualizarEstadoPago();
  sel.addEventListener('change', onCambioMontoEstimado);
}

    // tambien escuchar cambios manuales en monto para recalcular monto final
    const montoInpManual = document.querySelector('input[name="monto"]') || document.getElementById('monto');
    if (montoInpManual) {
      montoInpManual.addEventListener('input', () => {
        const mb = Number(montoInpManual.value || 0);
        aplicarDescuentoYMostrar(descuentoFila, mb, descuentoAplicableFila);
      });
    }
  }

  document.getElementById('tipo_pago')?.addEventListener('change', () => {
  const tipo = (document.getElementById('tipo_pago').value || '').toLowerCase();
  document.querySelector('.pago-mensual')?.setAttribute('style', tipo === 'mensualidad' ? 'display:block' : 'display:none');
  // Repoblar montos
  populateMontosSelect(null, null, '#monto_estimado', tipo === 'mensualidad' ? 'Mensualidad' : 'Matricula')
    .then(() => onCambioMontoEstimado())
    .catch(() => {});
});

  // Auto-init cuando la página contiene la tabla de pendientes o el select monto_estimado
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.pago-mensual').style.display = 'none';
    document.querySelector('.tabla-mensualidades-pendientes').style.display = 'none';
    document.querySelector('.tabla-montos-incompletos').style.display = 'none';
    document.getElementById('descuento').style.display = 'none';
    document.querySelector('.tabla-matriculas-pendientes').style.display = 'block';
    document.getElementById('tipo_pago').addEventListener('change', function () {
        document.querySelector('.pago-mensual').style.display = this.value === 'Mensualidad' ? 'block' : 'none';
        document.querySelector('.tabla-mensualidades-pendientes').style.display = this.value === 'Mensualidad' ? 'block' : 'none';
        document.querySelector('.tabla-matriculas-pendientes').style.display = this.value === 'Matricula' ? 'block' : 'none';
        document.getElementById('descuento').style.display = this.value === 'Mensualidad' ? 'block' : 'none';
        document.querySelector('.tabla-montos-incompletos').style.display = this.value === 'Montos incompletos' ? 'block' : 'none';
        populateMontosSelect(null, null, '#monto_estimado', this.value).catch(() => {});
    });
    if (document.querySelector('.matriculas-pendientes-list')) {
      cargarMatriculasPendientes();
    }
    if (document.querySelector('.mensualidades-pendientes-list')) {
      cargarMensualidadesPendientes();
    }
    if (document.querySelector('#mes_a_pagar')) {
      cargarMensualidadesRegistradas('#mes_a_pagar');
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
      const f = e.target;
      const tipo_pago = f.tipo_pago.value;
      const montoEstimado = Number(f.monto.value || 0);          // referencia
      const montoRecibido = Number(f.monto_recibido.value || 0); // ingreso usuario
      if (!montoEstimado) return alert('Seleccione monto estimado');
      if (!montoRecibido) return alert('Ingrese monto recibido');

      const payload = {
        tipo_pago,
        monto: montoEstimado,                // referencia (por compatibilidad)
        monto_recibido: montoRecibido,       // REAL
        metodo_pago: f.metodo_pago.value,
        descripcion: f.descripcion.value || null,
        estimar_monto_id_estimar_monto: f.monto_estimado.value ? Number(f.monto_estimado.value) : null,
        matricula_id: f.matricula_id ? Number(f.matricula_id.value) : null,
        mensualidades_id_pago: f.mes_a_pagar ? Number(f.mes_a_pagar.value) : null,
        usuarios_id_usuarios: 1,
        descuento_pct: (tipo_pago.toLowerCase() === 'mensualidad' &&
                        document.getElementById('descuento_aplicado')?.dataset.aplicable === '1')
          ? Number(document.getElementById('descuento_aplicado')?.dataset.pct || 0)
          : null
      };

      try {
        const resp = await crearPago(payload);
        alert(`Pago registrado. Estado: ${resp.estado_pago}`);
        f.reset();
        document.getElementById('estado_pago_display').value = '';
        document.getElementById('monto_final').value = '';
        populateMontosSelect(null, null, '#monto_estimado');
      } catch (err) {
        alert('Error: ' + (err.message || err));
      }
    });
  }
  });

  window.apiPagos = {
    obtenerMontosMatricula,
    populateMontosSelect,
    crearPago,
    cargarMatriculasPendientes,
    cargarMensualidadesPendientes
  };
})();