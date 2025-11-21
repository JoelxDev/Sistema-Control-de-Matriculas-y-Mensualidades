import { requireSession, fetchAuth  } from '/js/auth.js';
requireSession();

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('periodos-list');
  if (!tbody) return;

  fetchAuth('/api/pagos/todos')
    .then(res => {
      if (!res.ok) throw new Error('Error al obtener pagos');
      return res.json();
    })
    .then(data => {
      tbody.innerHTML = '';
      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="14">No hay pagos registrados</td></tr>';
        return;
      }
      data.forEach(p => {
        const nombre = ((p.nombre_est || '') + ' ' + (p.apellido_est || '')).trim();
        const montoEstimado = p.monto_estimado != null ? Number(p.monto_estimado).toFixed(2) : '';
        const montoFinal = p.monto_final != null ? Number(p.monto_final).toFixed(2) : (p.monto_pago != null ? Number(p.monto_pago).toFixed(2) : '');
        const comprobante = p.comprobante_pag ? `<a href="${escapeAttr(p.comprobante_pag)}" target="_blank">Ver</a>` : '';
        const mes = p.mes_display || (p.tipo_pago && p.tipo_pago.toLowerCase() === 'matricula' ? 'no aplica' : '');
        const fechaLim = p.fecha_limite_display || '';
        const descuento = p.descuento_display || 'sin descuento';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(nombre)}</td>
          <td>${escapeHtml(p.nombre_niv || '')}</td>
          <td>${escapeHtml(p.nombre_grad || '')}</td>
          <td>${escapeHtml(p.tipo_pago || '')}</td>
          <td>${escapeHtml(mes)}</td>
          <td>${escapeHtml(fechaLim)}</td>
          <td>${escapeHtml(montoEstimado)}</td>
          <td>${escapeHtml(descuento)}</td>
          <td>${escapeHtml(montoFinal)}</td>
          <td>${escapeHtml(p.metodo_pago || '')}</td>
          <td>${escapeHtml(p.descripcion || '')}</td>
          <td>${escapeHtml(p.fecha_pago ? new Date(p.fecha_pago).toLocaleString() : '')}</td>
          <td>${escapeHtml(p.usuarios_id_usuarios || '')}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="14">Error cargando pagos</td></tr>';
    });

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }
});