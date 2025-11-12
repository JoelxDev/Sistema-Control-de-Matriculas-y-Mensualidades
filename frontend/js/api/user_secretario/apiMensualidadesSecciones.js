import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', () => {
  if (!location.pathname.endsWith('/secretario/mensualidades')) return;

  fetchAuth('/api/secciones')
    .then(r => r.json())
    .then(secciones => {
      const niveles = {};
      (secciones || []).forEach(sec => {
        const nivel = sec.nombre_niv || sec.nivel || 'N/A';
        const grado = sec.nombre_grad || sec.grado || 'N/A';
        if (!niveles[nivel]) niveles[nivel] = {};
        if (!niveles[nivel][grado]) niveles[nivel][grado] = [];
        niveles[nivel][grado].push(sec);
      });

      const cont = document.querySelector('.nivel-secciones');
      cont.innerHTML = '';
      Object.entries(niveles).forEach(([niv, grados]) => {
        let html = `
          <div class="nivel">
            <div class="datos-nivel"><div class="titulo-nivel"><h2>Nivel: ${niv}</h2></div></div>
            <div class="secciones">`;
        Object.entries(grados).forEach(([gra, secs]) => {
          secs.forEach(s => {
            html += `
              <div class="datos-seccion" data-id="${s.id_seccion}">
                <div class="titulo-seccion"><h3>${gra} - ${s.nombre}</h3></div>
                <button class="btn-pdf" data-id="${s.id_seccion}">Descargar pdf</button>
              </div>`
          });
        });
        html += `</div></div>`;
        cont.insertAdjacentHTML('beforeend', html);
      });
      // <-- ADD: handlers para botones PDF (evitar que se propague el click al contenedor)
      cont.querySelectorAll('.btn-pdf').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          const id = btn.dataset.id;
          const mesTope = new Date().getMonth() + 1;
          const url = `/api/mensualidades/seccion/${encodeURIComponent(id)}/pdf?hastaMes=${mesTope}`;
          window.open(url, '_blank');
        });
      });

      cont.querySelectorAll('.datos-seccion').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.id;
          location.href = `/secretario/mensualidades/detalles_seccion?id=${encodeURIComponent(id)}`;
        });
      });

      cont.querySelectorAll('.datos-seccion').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.id;
          location.href = `/secretario/mensualidades/detalles_seccion?id=${encodeURIComponent(id)}`;
        });
      });
    })
    .catch(err => console.error('Error cargando secciones:', err));
});
document.addEventListener('DOMContentLoaded', async () => {
  if (!window.location.pathname.includes('/secretario/mensualidades/detalles_seccion')) return;

  // Asegura la tabla
  const contTabla = document.querySelector('.tabla-list-est-seccion');
  if (contTabla && !document.getElementById('tabla-mens-seccion')) {
    contTabla.innerHTML = `
      <div class="tabla-detalles">
        <table id="tabla-mens-seccion">
          <thead><tr id="thead-meses"></tr></thead>
          <tbody id="tbody-mens"></tbody>
        </table>
      </div>
    `;
  }

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const params = new URLSearchParams(location.search);
  const seccionId = params.get('id');
  if (!seccionId) return;

  const mesTope = new Date().getMonth() + 1;
  const thead = document.getElementById('thead-meses');
  const tbody = document.getElementById('tbody-mens');

  thead.innerHTML = ['<th>Estudiante</th>', ...MONTHS.map(m => `<th>${m}</th>`)].join('');

  const res = await fetchAuth(`/api/mensualidades/seccion/${encodeURIComponent(seccionId)}?hastaMes=${mesTope}`);
  if (!res.ok) { console.error('No se pudo cargar la sección'); return; }
  const { rows } = await res.json();

  const porEst = new Map();
  (rows || []).forEach(r => {
    const key = r.id_estudiante;
    if (!porEst.has(key)) porEst.set(key, { nombre: `${r.apellido_est}, ${r.nombre_est}`, meses: {} });
    porEst.get(key).meses[String(r.mes || '').toLowerCase()] = r;
  });

  const html = [];
  porEst.forEach(est => {
    const celdas = MONTHS.map((m, idx) => {
      if (idx + 1 > mesTope) return `<td class="no-vencido">-</td>`;
      const row = est.meses[m.toLowerCase()];
      if (!row) return `<td class="pendiente">Pendiente</td>`;
      return row.pagado ? `<td class="pagado">Pagado</td>` : `<td class="pendiente">Pendiente</td>`;
    });
    html.push(`<tr><td>${est.nombre}</td>${celdas.join('')}</tr>`);
  });

  tbody.innerHTML = html.join('');
});