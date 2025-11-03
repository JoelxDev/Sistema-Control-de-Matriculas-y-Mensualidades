document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('/admin/aulasSecciones')) {
        fetch('/api/secciones')
            .then(res => res.json())
            .then(secciones => {
                // Organizar secciones por niveles y grados
                const niveles = {};
                secciones.forEach(sec => {
                    if (!niveles[sec.nombre_niv]) niveles[sec.nombre_niv] = {};
                    if (!niveles[sec.nombre_niv][sec.nombre_grad]) niveles[sec.nombre_niv][sec.nombre_grad] = [];
                    niveles[sec.nombre_niv][sec.nombre_grad].push(sec);
                });

                // Renderizar en el HTML
                const contenedor = document.querySelector('.nivel-secciones');
                contenedor.innerHTML = '';
                Object.entries(niveles).forEach(([nivel, grados]) => {
                    let htmlNivel = `
                        <div class="nivel">
                        <div class="datos-nivel">
                            <div class="titulo-nivel"><h2>Nivel: ${nivel}</h2></div>
                        </div>
                        <div class="secciones">
                    `;
                    Object.entries(grados).forEach(([grado, secciones]) => {
                        secciones.forEach(sec => {
                            htmlNivel += `
                            <div class="datos-seccion" data-id-seccion="${sec.id_seccion}">
                                <div class="titulo-seccion"><h3>${grado} - ${sec.nombre}</h3></div>
                                <div class="vact-disp-seccion"><p>Vacantes Disp: ${sec.vacantes_disponibles || 0}</p></div>
                                <div class="tot-estud-seccion"><p>Total Estud: ${sec.total_estudiantes || 0}</p></div>
                                <div class="estado-seccion">
                                    <p>Estado Aula: <span class="${sec.estado_aula === 'Completo' ? 'estado-completo' : 'estado-disponible'}">${sec.estado_aula || 'Disponible'}</span></p>
                                </div>
                            </div>
                        `;
                        });
                    });
                    htmlNivel += `</div></div>`;
                    contenedor.innerHTML += htmlNivel;
                });
                
                // Agregar eventos para redirigir al hacer clic en una sección
                document.querySelectorAll('.datos-seccion').forEach(div => {
                    div.addEventListener('click', function () {
                        const id = div.dataset.idSeccion;
                        window.location.href = `/admin/aulasSecciones/detalles_seccion?id=${id}`;
                    });
                });
            })
            .catch(err => {
                console.error('Error al cargar secciones:', err);
            });
    }
});