// ...existing code or replace if simple...
import { fetchAuth, requireSession } from '/js/auth.js';
requireSession();

async function cargarSecuenciasIncompletas(selector = '.secuencias-incompletas-list', anioAcadId = null) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';
  try {
    const qs = new URLSearchParams();
    if (anioAcadId) qs.set('anioAcadId', anioAcadId);
    const res = await fetchAuth(`/api/pagos/incompletos/secuencia?${qs.toString()}`);
    if (!res.ok) throw new Error('Error servidor');
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">Sin pagos incompletos</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    data.forEach(g => {
      // construir secuencia: #1: 50 (acum 50 / rest 200), etc.
      const seq = g.pagos.length
        ? g.pagos.map((p,i) => `#${i+1}: S/${p.monto_recibido.toFixed(2)} (acum S/${p.acumulado.toFixed(2)} / rest S/${p.restante.toFixed(2)})`).join('<br>')
        : 'Sin pagos';
      const pendiente = g.pagos.length
        ? 'S/' + Math.max(g.estimado - (g.pagos[g.pagos.length-1].acumulado),0).toFixed(2)
        : 'S/' + g.estimado.toFixed(2);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g.tipo_pago}</td>
        <td>${g.matricula_id}</td>
        <td>${g.mensualidades_id_pago || '-'}</td>
        <td>S/${g.estimado.toFixed(2)}</td>
        <td>${g.estado_grupo}</td>
        <td>${seq}</td>
        <td>${pendiente}</td>
        <td><button class="btn-aportar"
              data-tipo="${g.tipo_pago}"
              data-matricula="${g.matricula_id}"
              data-mensualidad="${g.mensualidades_id_pago || ''}"
              data-restante="${pendiente.replace('S/','')}"
            >Registrar pago</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-aportar').forEach(btn => {
      btn.addEventListener('click', () => prepararFormularioAporte(btn.dataset));
    });
  } catch (e) {
    console.error(e);
    tbody.innerHTML = '<tr><td colspan="8">Error al cargar</td></tr>';
  }
}

function prepararFormularioAporte(ds) {
  const form = document.querySelector('.formulario-pagos form');
  if (!form) return;
  // tipo
  const tipoSel = form.querySelector('#tipo_pago');
  if (tipoSel) {
    tipoSel.value = ds.tipo;
    tipoSel.dispatchEvent(new Event('change'));
  }
  // matricula hidden
  let hid = document.getElementById('matricula_id');
  if (!hid) {
    hid = document.createElement('input');
    hid.type = 'hidden';
    hid.id = 'matricula_id';
    hid.name = 'matricula_id';
    form.appendChild(hid);
  }
  hid.value = ds.matricula;

  // mensualidad (si aplica)
  if (ds.tipo.toLowerCase() === 'mensualidad' && ds.mensualidad) {
    let hm = document.getElementById('mensualidades_id_pago');
    if (!hm) {
      hm = document.createElement('input');
      hm.type = 'hidden';
      hm.id = 'mensualidades_id_pago';
      hm.name = 'mensualidades_id_pago';
      form.appendChild(hm);
    }
    hm.value = ds.mensualidad;
  }

  // monto_recibido: sugerir restante
  const montoRec = form.querySelector('input[name="monto_recibido"]');
  if (montoRec) {
    montoRec.value = ds.restante;
    montoRec.focus();
  }
  // monto (estimado) lo carga tu select normal tras elegir matrícula/mes
}

document.addEventListener('DOMContentLoaded', () => {
  cargarSecuenciasIncompletas();
});

export { cargarSecuenciasIncompletas };