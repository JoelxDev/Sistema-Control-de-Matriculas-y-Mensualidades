document.addEventListener('DOMContentLoaded', function () {
    // Cargar secciones, grados y niveles al cargar la página principal de aulas
    if (window.location.pathname.endsWith('/secretario/aulas')) {
        fetch('/api/secciones')
            .then(res => res.json())
            .then(secciones => {
                // Aquí puedes organizar los datos por nivel y grado
                // Ejemplo: agrupar por nivel y luego por grado
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
                            <div class="datos-seccion">
                            <div class="titulo-seccion"><h3>${grado} - ${sec.nombre}</h3></div>
                            <div class="vact-disp-seccion"><p>Vacantes Disp: ${sec.capacidad_maxima || ''}</p></div>
                            <div class="estado-seccion"><p>Estado Aula: ${sec.estado_aula || ''}</p></div>
                            </div>
                        `;
                        });
                    });
                    htmlNivel += `</div></div>`;
                    contenedor.innerHTML += htmlNivel;
                });
            })
            .catch(err => {
                console.error('Error al cargar secciones:', err);
            });
    }
});