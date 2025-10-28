// ...existing code...
document.addEventListener('DOMContentLoaded', async () => {
  const API_DEUDORES = '/api/deudores'; // <- prefijo real de tus endpoints de deudores
  // Ajusta estos endpoints si tus rutas son distintas
  const API_CAT = {
    niveles: '/api/niveles',
    grados: (nivelId) => `/api/grados?nivelId=${encodeURIComponent(nivelId)}`,
    secciones: (gradoId) => `/api/secciones?gradoId=${encodeURIComponent(gradoId)}`
  };

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const container = document.querySelector('.lista-deudores');
  if (container && !container.querySelector('.tabla-detalles')) {
    container.innerHTML = `
      <table class="tabla-detalles">
        <thead><tr></tr></thead>
        <tbody id="listaDeudores"></tbody>
      </table>
    `;
  }

  const headRow = document.querySelector('.tabla-detalles thead tr');
  if (!headRow) return;

  const tbody   = document.getElementById('listaDeudores');

  const nivelSel   = document.getElementById('nivel');
  const gradoSel   = document.getElementById('grado');
  const seccionSel = document.getElementById('seccion');

  let meses = [];
  let deudores = [];

  const monthIdx = (name) => MONTHS.indexOf(name) + 1;
  const mesActual = () => new Date().getMonth() + 1;

  async function getJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} - ${url}`);
    return res.json();
  }

  // Cargar catálogos
  async function loadNiveles() {
    const data = await getJSON(API_CAT.niveles);
    const niveles = Array.isArray(data) ? data : (data.niveles || []);
    nivelSel.innerHTML = `<option value="">Todos</option>` +
      niveles.map(n => `<option value="${n.id_nivel}">${n.nombre_niv}</option>`).join('');
  }

  async function loadGrados(nivelId) {
    gradoSel.innerHTML = `<option value="">Todos</option>`;
    seccionSel.innerHTML = `<option value="">Todas</option>`;
    if (!nivelId) return;
    const data = await getJSON(API_CAT.grados(nivelId));
    const grados = Array.isArray(data) ? data : (data.grados || []);
    gradoSel.innerHTML = `<option value="">Todos</option>` +
      grados.map(g => `<option value="${g.id_grado}">${g.nombre_grad}</option>`).join('');
  }

  async function loadSecciones(gradoId) {
    seccionSel.innerHTML = `<option value="">Todas</option>`;
    if (!gradoId) return;
    const data = await getJSON(API_CAT.secciones(gradoId));
    const secciones = Array.isArray(data) ? data : (data.secciones || []);
    seccionSel.innerHTML = `<option value="">Todas</option>` +
      secciones.map(s => `<option value="${s.id_seccion}">${s.nombre}</option>`).join('');
  }

  // Cabecera de meses
  async function loadMeses() {
    const data = await getJSON(`${API_DEUDORES}/meses`);
    const dbMeses = Array.isArray(data.meses) ? data.meses : [];
    // Fallback por si la tabla no tiene todos los meses
    const set = new Set([...MONTHS, ...dbMeses]);
    meses = MONTHS.filter(m => set.has(m));

    headRow.innerHTML = [
      '<th>Estudiante</th>',
      '<th>Nivel</th>',
      '<th>Grado</th>',
      '<th>Sección</th>',
      ...meses.map(m => `<th>${m}</th>`),
      '<th>Pend.</th>'
    ].join('');
  }

  // Traer deudores aplicando filtros
  async function loadDeudores() {
    const qs = new URLSearchParams();
    if (nivelSel?.value)   qs.append('nivelId', nivelSel.value);
    if (gradoSel?.value)   qs.append('gradoId', gradoSel.value);
    if (seccionSel?.value) qs.append('seccionId', seccionSel.value);
    // Si quieres incluir meses futuros como pendientes, descomenta:
    // qs.append('incluirFuturos', '1');

    const data = await getJSON(`${API_DEUDORES}/pendientes?${qs.toString()}`);
    deudores = Array.isArray(data.deudores) ? data.deudores : [];
  }

  function render() {
    const idxActual = mesActual();
    const rows = deudores.map(d => {
      const pendientes = new Set(String(d.meses_pendientes || '')
        .split(',').map(s => s.trim().toLowerCase()).filter(Boolean));

      const celdasMeses = meses.map(m => {
        const idx = monthIdx(m);
        if (idx > idxActual) return `<td class="no-vencido">-</td>`;
        return pendientes.has(m.toLowerCase()) ? `<td class="pendiente">Pendiente</td>` : `<td class="pagado"></td>`;
      });

      const nombre = [d.apellido_est, d.nombre_est].filter(Boolean).join(', ');
      return `
        <tr>
          <td>${nombre}</td>
          <td>${d.nivel || ''}</td>
          <td>${d.grado || ''}</td>
          <td>${d.seccion || ''}</td>
          ${celdasMeses.join('')}
          <td>${d.cantidad_pendiente || 0}</td>
        </tr>
      `;
    });

    tbody.innerHTML = rows.join('');
  }

  // Eventos de filtros en cascada
  nivelSel?.addEventListener('change', async () => {
    await loadGrados(nivelSel.value);
    await loadDeudores();
    render();
  });

  gradoSel?.addEventListener('change', async () => {
    await loadSecciones(gradoSel.value);
    await loadDeudores();
    render();
  });

  seccionSel?.addEventListener('change', async () => {
    await loadDeudores();
    render();
  });

  // Init
  try {
    await Promise.all([loadMeses(), loadNiveles()]);
    await loadDeudores();
    render();
  } catch (e) {
    console.error('Error inicializando vista de deudores:', e);
  }
});