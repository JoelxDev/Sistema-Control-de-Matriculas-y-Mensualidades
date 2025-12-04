// Usar la config global expuesta en window (frontend/public/js/config.js)
const API_CONFIG = window.API_CONFIG || { baseURL: '/api', get: (e) => fetch(e) };

// Obtener pagos incompletos (matriz)
async function obtenerPagosIncompletos(anioAcadId = null) {
  try {
    let endpoint = `/pagos/incompletos/matrix`;
    if (anioAcadId) endpoint += `?anioAcadId=${encodeURIComponent(anioAcadId)}`;

    const url = `${API_CONFIG.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al obtener pagos incompletos');

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Formatear montos
function formatearMonto(monto) {
  return `${Number(monto || 0).toFixed(2)}`;
}

// Clase CSS según estado
function obtenerClaseEstado(estado) {
  switch (estado) {
    case 'Completo': return 'estado-completo';
    case 'Incompleto': return 'estado-incompleto';
    case 'Pendiente': return 'estado-pendiente';
    default: return '';
  }
}

// Determinar estado a partir de esperado vs acumulado
function estadoDesdeMontos(esperado, acumulado) {
  const esp = Number(esperado || 0);
  const acu = Number(acumulado || 0);
  if (esp <= 0) return 'Pendiente';
  if (acu >= esp) return 'Completo';
  if (acu > 0 && acu < esp) return 'Incompleto';
  return 'Pendiente';
}

// Render - SOLO INCOMPLETOS
function renderizarTablaPagos(pagos) {
  const tbody = document.getElementById('pagosIncompletos-list');
  if (!tbody) {
    console.error('No se encontró el elemento tbody con id "pagosIncompletos-list"');
    return;
  }
  tbody.innerHTML = '';

  const mesesOrden = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  // Filtrar filas: SOLO mostrar si matrícula o algún mes está 'Incompleto'
  const filas = (pagos || []).filter(p => {
    const mat = p.matricula || {};
    const estadoMat = mat.estado || estadoDesdeMontos(mat.esperado ?? p.matricula_esperado, mat.acumulado ?? p.matricula_acumulado ?? 0);
    
    // Verificar si matrícula es incompleta
    if (estadoMat === 'Incompleto') return true;
    
    // Verificar si algún mes es incompleto
    const meses = p.meses || {};
    return mesesOrden.some(m => {
      const md = meses[m] || meses[m.charAt(0).toUpperCase() + m.slice(1)];
      if (!md) return false;
      const estadoMes = md.estado || estadoDesdeMontos(md.esperado, md.acumulado);
      return estadoMes === 'Incompleto';
    });
  });

  if (filas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="19" style="text-align: center; padding: 20px;">
          No hay pagos incompletos registrados
        </td>
      </tr>
    `;
    return;
  }

  filas.forEach(pago => {
    const tr = document.createElement('tr');

    const tdEstudiante = document.createElement('td');
    tdEstudiante.textContent = pago.estudiante || `${pago.apellido_est || ''}, ${pago.nombre_est || ''}`.trim();
    tr.appendChild(tdEstudiante);

    const tdDNI = document.createElement('td');
    tdDNI.textContent = pago.dni_est || 'N/A';
    tr.appendChild(tdDNI);

    const tdNivel = document.createElement('td');
    tdNivel.textContent = pago.nivel || 'N/A';
    tr.appendChild(tdNivel);

    const tdGrado = document.createElement('td');
    tdGrado.textContent = pago.grado || 'N/A';
    tr.appendChild(tdGrado);

    const tdSeccion = document.createElement('td');
    tdSeccion.textContent = pago.seccion || 'N/A';
    tr.appendChild(tdSeccion);

    // Matrícula: mostrar detalle solo si incompleta
    const tdMatricula = document.createElement('td');
    const matricula = pago.matricula || {
      esperado: pago.matricula_esperado,
      acumulado: pago.matricula_acumulado || 0,
      pendiente: Math.max(Number(pago.matricula_esperado || 0) - Number(pago.matricula_acumulado || 0), 0),
      cantidad_pagos: 0
    };
    const estadoMatricula = matricula.estado || estadoDesdeMontos(matricula.esperado, matricula.acumulado);
    
    if (estadoMatricula === 'Incompleto') {
      tdMatricula.innerHTML = `
        <div class="${obtenerClaseEstado(estadoMatricula)}">
          <strong>Incompleto</strong><br>
          <small>Pte: ${formatearMonto(matricula.pendiente)}</small><br>
          <small>Ados: [${formatearMonto(matricula.acumulado)}]</small> <br>
          <small>Edo: ${formatearMonto(matricula.esperado)}</small>
        </div>
      `;
    } else {
      // Si está completa o pendiente, mostrar estado simple
      tdMatricula.innerHTML = `<div class="${obtenerClaseEstado(estadoMatricula)}">${estadoMatricula}</div>`;
    }
    tr.appendChild(tdMatricula);

    // Meses: mostrar detalle SOLO si incompleto, resto mostrar estado simple
    const mesesData = pago.meses || {};
    mesesOrden.forEach(mesNombre => {
      const tdMes = document.createElement('td');
      const md = mesesData[mesNombre] || mesesData[mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)];
      
      if (md) {
        const estadoMes = md.estado || estadoDesdeMontos(md.esperado, md.acumulado);
        const pendiente = Math.max(Number(md.esperado || 0) - Number(md.acumulado || 0), 0);
        
        if (estadoMes === 'Incompleto') {
          // Mostrar detalle completo con acumulado de cuotas
          tdMes.innerHTML = `
            <div class="${obtenerClaseEstado(estadoMes)}">
              <strong>Incompleto</strong><br>
              <small>Pte: ${formatearMonto(pendiente)}</small><br>
              <small>Acum: [${formatearMonto(md.acumulado)}] </small> <br>
              <small>Edo: ${formatearMonto(md.esperado)}</small>
            </div>
          `;
        } else {
          // Completo o Pendiente: mostrar solo estado
          tdMes.innerHTML = `<div class="${obtenerClaseEstado(estadoMes)}">${estadoMes}</div>`;
        }
      } else {
        tdMes.textContent = '-';
      }
      tr.appendChild(tdMes);
    });

    const tdAcciones = document.createElement('td');
    tdAcciones.innerHTML = `
      <button class="btn-pagar" data-id="${pago.id_matricula}">Registrar Pago</button>
    `;
    tr.appendChild(tdAcciones);

    tbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-pagar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const matriculaId = e.target.dataset.id;
      registrarPago(matriculaId);
    });
  });
}

function registrarPago(matriculaId) {
  // Buscar el pago completo en la lista renderizada
  const todosLosPagos = window.pagosIncompletosData || [];
  const pagoEncontrado = todosLosPagos.find(p => p.id_matricula === Number(matriculaId));
  
  if (!pagoEncontrado) {
    alert('No se encontraron datos del pago');
    return;
  }
  
  // Determinar cuál es el primer pago incompleto (matrícula o mensualidad)
  const matricula = pagoEncontrado.matricula || {
    esperado: pagoEncontrado.matricula_esperado,
    acumulado: pagoEncontrado.matricula_acumulado || 0,
    pendiente: Math.max(Number(pagoEncontrado.matricula_esperado || 0) - Number(pagoEncontrado.matricula_acumulado || 0), 0)
  };
  const estadoMatricula = matricula.estado || estadoDesdeMontos(matricula.esperado, matricula.acumulado);
  
  let tipoPago = null;
  let montoEsperado = 0;
  let montoAcumulado = 0;
  let montoPendiente = 0;
  let mensualidadId = null;
  let mesNombre = null;
  
  // Si la matrícula está incompleta, ese es el primer pago
  if (estadoMatricula === 'Incompleto') {
    tipoPago = 'Matricula';
    montoEsperado = Number(matricula.esperado || 0);
    montoAcumulado = Number(matricula.acumulado || 0);
    montoPendiente = Number(matricula.pendiente || 0);
  } else {
    // Buscar el primer mes incompleto
    const mesesOrden = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const mesesData = pagoEncontrado.meses || {};
    for (const mesNorm of mesesOrden) {
      const md = mesesData[mesNorm] || mesesData[mesNorm.charAt(0).toUpperCase() + mesNorm.slice(1)];
      if (md) {
        const estadoMes = md.estado || estadoDesdeMontos(md.esperado, md.acumulado);
        if (estadoMes === 'Incompleto') {
          tipoPago = 'Mensualidad';
          montoEsperado = Number(md.esperado || 0);
          montoAcumulado = Number(md.acumulado || 0);
          montoPendiente = Math.max(montoEsperado - montoAcumulado, 0);
          mensualidadId = md.id_mes || null;
          mesNombre = mesNorm;
          break;
        }
      }
    }
  }
  
  if (!tipoPago) {
    alert('No se encontró ningún pago incompleto');
    return;
  }
  
  // Cargar datos en el formulario
  cargarDatosEnFormulario({
    ...pagoEncontrado,
    tipo_pago: tipoPago,
    monto_esperado: montoEsperado,
    monto_acumulado: montoAcumulado,
    monto_pendiente: montoPendiente,
    mensualidad_id: mensualidadId,
    mes_nombre: mesNombre
  });
}

function cargarDatosEnFormulario(datos) {
  // Llenar datos del estudiante
  const estudianteInp = document.querySelector('input[name="estudiante"]');
  const nivelInp = document.querySelector('input[name="nivel"]');
  const gradoInp = document.querySelector('input[name="grado"]');
  const seccionInp = document.querySelector('input[name="seccion"]');
  
  if (estudianteInp) estudianteInp.value = datos.estudiante || `${datos.apellido_est || ''}, ${datos.nombre_est || ''}`.trim();
  if (nivelInp) nivelInp.value = datos.nivel || '';
  if (gradoInp) gradoInp.value = datos.grado || '';
  if (seccionInp) seccionInp.value = datos.seccion || '';
  
  // Crear/actualizar hidden input para id_matricula
  let hidMatricula = document.getElementById('matricula_id');
  if (!hidMatricula) {
    hidMatricula = document.createElement('input');
    hidMatricula.type = 'hidden';
    hidMatricula.id = 'matricula_id';
    hidMatricula.name = 'matricula_id';
    document.querySelector('.formulario-pagos form').appendChild(hidMatricula);
  }
  hidMatricula.value = datos.id_matricula;
  
  // Seleccionar tipo de pago
  const tipoPagoSel = document.getElementById('tipo_pago');
  if (tipoPagoSel) {
    tipoPagoSel.value = datos.tipo_pago;
    tipoPagoSel.dataset.fromIncompletos = 'true'; // Marcar que viene de incompletos
    tipoPagoSel.dispatchEvent(new Event('change'));
  }
  
  // Esperar un momento para que se carguen los montos estimados
  setTimeout(() => {
    // Seleccionar monto estimado y bloquearlo
    const montoEstimadoSel = document.getElementById('monto_estimado');
    if (montoEstimadoSel && datos.monto_esperado) {
      // Buscar la opción con el monto correcto
      Array.from(montoEstimadoSel.options).forEach(opt => {
        const optMonto = Number(opt.dataset?.monto || 0);
        if (Math.abs(optMonto - datos.monto_esperado) < 0.01) {
          montoEstimadoSel.value = opt.value;
          montoEstimadoSel.dispatchEvent(new Event('change'));
        }
      });
      
      // Bloquear el select de monto estimado
      montoEstimadoSel.disabled = true;
      montoEstimadoSel.style.backgroundColor = '#e0e0e0';
      montoEstimadoSel.style.cursor = 'not-allowed';
    }
    
    // Si es mensualidad, seleccionar el mes
    if (datos.tipo_pago === 'Mensualidad' && datos.mensualidad_id) {
      const mesAPagarSel = document.getElementById('mes_a_pagar');
      if (mesAPagarSel) {
        mesAPagarSel.value = datos.mensualidad_id;
        mesAPagarSel.disabled = true;
        mesAPagarSel.style.backgroundColor = '#e0e0e0';
        mesAPagarSel.style.cursor = 'not-allowed';
      }
    }
    
    // Establecer monto esperado
    const montoInp = document.querySelector('input[name="monto"]');
    if (montoInp) {
      montoInp.value = datos.monto_esperado.toFixed(2);
      montoInp.readOnly = true;
      montoInp.style.backgroundColor = '#e0e0e0';
    }
    
    // Prellenar monto recibido con monto pendiente
    const montoRecibidoInp = document.querySelector('input[name="monto_recibido"]');
    if (montoRecibidoInp && datos.monto_pendiente) {
      montoRecibidoInp.value = datos.monto_pendiente.toFixed(2);
      montoRecibidoInp.focus();
      montoRecibidoInp.dispatchEvent(new Event('input'));
    }
    
    // Mostrar mensaje informativo
    const mensaje = datos.monto_acumulado > 0 
      ? `Cuota ${datos.tipo_pago} - Acumulado: S/ ${datos.monto_acumulado.toFixed(2)} | Pendiente: S/ ${datos.monto_pendiente.toFixed(2)}`
      : `Pago ${datos.tipo_pago} - Monto pendiente: S/ ${datos.monto_pendiente.toFixed(2)}`;
    
    const descripcionInp = document.querySelector('input[name="descripcion"]');
    if (descripcionInp) {
      descripcionInp.value = mensaje;
    }
  }, 500);
}

// Guardar los datos globalmente para acceso posterior
window.pagosIncompletosData = [];

document.addEventListener('DOMContentLoaded', async () => {
  const pagos = await obtenerPagosIncompletos();
  window.pagosIncompletosData = pagos;
  renderizarTablaPagos(pagos);
});

export { obtenerPagosIncompletos, renderizarTablaPagos };