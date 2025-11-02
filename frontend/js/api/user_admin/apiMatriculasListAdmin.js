function cargarMatriculas() {
    fetch('/api/matriculas')
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
          <td>${m.seccion_nombre}</td>
          <td>${m.nombre_per}</td>
          <td>${m.anio_acad}</td>
          
        `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('Error:', err));
}
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/matriculas')) {
        cargarMatriculas();
    }
});
