// const express = require('express');
// const app = express();
// const port = 3000;

// app.get('/', (req, res) => res.send('API funcionando correctamente'));

// app.listen(port, () => {
//   console.log(`Servidor escuchando en el puerto ${port}`);
// });
const express = require('express');
const path = require('path');
const app = express();

const cors = require('cors');

require('dotenv').config();

app.use(cors());

//////////////////////////////////////////////////////////////
// API RUTA ADMIN

app.use(express.json());
const persAdminRoutes = require('./modules/personalAdmin/persAdmin.routes');
app.use('/api/admin/usuarios',persAdminRoutes);

// const estudiantesAdminRoutes = require('./modules/user-admin/estudiantesAdmin/estudiantes.routes');
// app.use('/api/admin/estudiantes', estudiantesAdminRoutes)

// const matriculasAdminRoutes = require('./modules/user-admin/matriculasAdmin/matriculas.routes');
// app.use('/api/admin/matriculas', matriculasAdminRoutes);

//////////////////////////////////////////////////////////////
// API RUTAS SECRETARIO

const nivelRoutes = require('./modules/aulas_seccionesSecr/nivel.routes');
app.use('/api/niveles', nivelRoutes);

const gradoRoutes = require('./modules/aulas_seccionesSecr/grado.routes');
app.use('/api/grados', gradoRoutes);

const aulaRoutes = require('./modules/aulas_seccionesSecr/aula.routes');
app.use('/api/aulas', aulaRoutes);

const seccionRoutes = require('./modules/aulas_seccionesSecr/seccion.routes');
app.use('/api/secciones', seccionRoutes);

const anioAcademicoRoutes = require('./modules/anio_academicoSecr/anioAcademico.routes');
app.use('/api/anio_academico', anioAcademicoRoutes);

const periodoRoutes = require('./modules/periodo_academicoSecr/periodo.routes');
app.use('/api/periodos', periodoRoutes);

const matriculaRoutes = require('./modules/matriculasSecr/matricula.routes');
app.use('/api/matriculas', matriculaRoutes);

const estudianteRoutes = require('./modules/estudiantesSecr/estudiante.routes');
app.use('/api/estudiantes', estudianteRoutes);

const descuentoRoutes = require('./modules/descuentosSecr/descuento.routes');
app.use('/api/descuentos', descuentoRoutes);

const montoRoutes = require('./modules/defMonstosSecr/monto.routes');
app.use('/api/definir_monto', montoRoutes);

const pagoRoutes = require('./modules/pagosSecr/pago.routes');
app.use('/api/pagos', pagoRoutes);

const mensuaRoutes = require('./modules/mensualidadesSecr/mensua.routes');
app.use('/api/mensualidades', mensuaRoutes);

const deudoresRoutes = require('./modules/deudoresSecr/deudores.routes');
app.use('/api/deudores', deudoresRoutes);



// const deudoresRoutes = require('./modules/user-secretary/deudoresSecr/deudores.routes');
// app.use('/api/deudores', deudoresRoutes);


//////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////
// VISTAS CON RUTAS PROTEGIDAS PARA EL ADMIN
//////////////////////////////////////////////////////////////

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static('/usr/src/frontend'));

// ruta corta para la página de estudiantes admin
app.get('/admin/perfil', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/perfilAdmin/perfilAdmin.html');
});
app.get('/admin/matriculas', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/matriculasAdmin/matriculasAdmin.html');
});

app.get('/admin/estudiantes', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/estudiantesAdmin/estudiantesAdmin.html');
});

app.get('/admin/estudiantes/informacion_estudiante', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/estudiantesAdmin/btn_informEstudiante.html');
});


app.get('/admin/mensualidades', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/mensualidadesAdmin.html');
});

app.get('/admin/mensualidades/meses', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/btn_meses.html');
});

app.get('/admin/mensualidades/meses/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/btn_registrar_meses.html');
});
app.get('/admin/mensualidades/meses/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/btn_editar_mes.html');
});

app.get('/admin/mensualidades/deudores', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/btn_lista_deudores.html');
});

app.get('/admin/mensualidades/detalles_seccion', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/modSeccionSelecDeu.html');
});



app.get('/admin/personal_administrativo', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/personalAdmin.html');
});

app.get('/admin/personal_administrativo/crear_personal', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/btn_crearPerAdmin.html');
});



app.get('/admin/aulasSecciones', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasSeccionesAdmin.html');
});

app.get('/admin/aulasSecciones/grados', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/gradosAdmin/gradosAdmin.html');
});

app.get('/admin/aulasSecciones/grados/crear', (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/gradosAdmin/btn_crear_grado.html');
})

app.get('/admin/aulasSecciones/grados/editar', (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/gradosAdmin/btn_editar_grado.html');
})


app.get('/admin/aulasSecciones/niveles', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/nivelesAdmin/nivelesAdmin.html');
});

app.get('/admin/aulasSecciones/niveles/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/nivelesAdmin/btn_crear_nivel.html');
});

app.get('/admin/aulasSecciones/niveles/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/nivelesAdmin/btn_editar_nivel.html');
});


app.get('/admin/aulasSecciones/secciones', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionesAdmin/seccionesAdmin.html');
});

app.get('/admin/aulasSecciones/secciones/crear', (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionesAdmin/btn_crear_seccion.html');
})

app.get('/admin/aulasSecciones/secciones/editar', (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionesAdmin/btn_editar_seccion.html');

})


app.get('/admin/aulasSecciones/aulas', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasAdmin/aulasAdmin.html');
});

app.get('/admin/aulasSecciones/aulas/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasAdmin/btn_crear_aula.html');
});

app.get('/admin/aulasSecciones/aulas/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasAdmin/btn_editar_aula.html');
});


app.get('/admin/aulasSecciones/detalles_seccion', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionSeleccionada.html');
});



app.get('/admin/descuentos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/descuentosAdmin/descuentosAdmin.html');
});

app.get('/admin/descuentos/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/descuentosAdmin/btn_crear_descuento.html');
});

app.get('/admin/descuentos/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/descuentosAdmin/btn_editar_descuento.html');
});







app.get('/admin/periodos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/periodosAdmin/periodosAdmin.html');
});
app.get('/admin/periodos/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/periodosAdmin/periodos_crear.html');
});
app.get('/admin/periodos/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/periodosAdmin/periodo_editar.html');
});

// Puedes agregar rutas cortas para otras vistas:

// PRUEBA para editar personal admin
app.get('/admin/personal_administrativo/editar_personal', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/btn_editarPerAdmin.html');
});

app.get('/admin/mensualidades/seccion_mensualidad', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/seccionMensualidad.html');
});

app.get('/admin/anioAcademico', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/anioAcademicoAdmin/anioAcademicoAdmin.html');
});
// ----------------------------
app.get('/admin/aulasSecciones', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasSeccionesAdmin.html');
});

    app.get('/admin/aulasSecciones/niveles', (req, res) => {
        res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/nivelesAdmin/nivrelesAdmin.html');
    });

    app.get('/admin/aulasSecciones/grados', (req, res) => {
        res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/gradosAdmin/gradosAdmin.html');
    });

    app.get('/admin/aulasSecciones/secciones', (req, res) => {
        res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionesAdmin/seccionesAdmin.html');
    });

    app.get('/admin/aulasSecciones/aulas', (req, res) => {
        res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasAdmin/aulasAdmin.html');
    });

app.get('/admin/descuentos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/descuentosAdmin/descuentosAdmin.html');
});

app.get('/admin/montosDefinidos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/montosDefinidosAdmin/montosDefinidosAdmin.html');
});

app.get('/admin/pagos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/pagosAdmin/pagosAdmin.html');
});

app.get('/admin/periodos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/periodosAdmin/periodosAdmin.html');
});

//////////////////////////////////////////////////////////////
// VISTAS CON RUTAS PROTEGIDAS PARA EL SECRETARIO
//////////////////////////////////////////////////////////////

app.get('/secretario/perfil', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/perfilSecretario/perfilSecretario.html');
});

app.get('/secretario/aulas', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/aulasSecretario.html');
});

app.get('/secretario/aulas/grados', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_grados.html');
});     

app.get('/secretario/aulas/niveles', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_niveles.html');
});

app.get('/secretario/aulas/secciones', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_secciones.html');
});
app.get('/secretario/aulas/detalles_seccion', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/modSeccionSeleccionada.html');
});
app.get('/secretario/aulas/aulas', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_aulas.html');
});

app.get('/secretario/aulas/niveles/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_nivel.html');
});
app.get('/secretario/aulas/niveles/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_editar_nivel.html');
});
app.get('/secretario/aulas/aulas/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_aula.html');
});
app.get('/secretario/aulas/aulas/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_editar_aula.html');
});

app.get('/secretario/aulas/grados/crear', (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_grado.html');
})
app.get('/secretario/aulas/grados/editar', (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_editar_grado.html');
})
app.get('/secretario/aulas/secciones/crear', (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_seccion.html');
})
app.get('/secretario/aulas/secciones/editar', (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_editar_seccion.html');
})

app.get('/secretario/matriculas', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/matriculasSecretario/matriculasSecretario.html');
});
app.get('/secretario/matriculas/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/matriculasSecretario/btn_EditarMat.html');
});

app.get('/secretario/registrar_matricula', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/matriculasSecretario/registrarMatSecretario.html');
});



app.get('/secretario/estudiantes', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/estudSecretario/estudSecretario.html');
});

app.get('/secretario/estudiantes/informacion_estudiante', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/estudSecretario/btn_informEstudiante.html');
});
app.get('/secretario/anio_academico', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/anioAcadSecretario/anio_academico.html');
});
app.get('/secretario/anio_academico/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/anioAcadSecretario/anio_academico_crear.html');
});
app.get('/secretario/anio_academico/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/anioAcadSecretario/anio_academico_editar.html');
});
app.get('/secretario/periodos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/periodoSecretario/periodos.html');
});
app.get('/secretario/periodos/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/periodoSecretario/periodos_crear.html');
});
app.get('/secretario/periodos/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/periodoSecretario/periodo_editar.html');
});



app.get('/secretario/mensualidades', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/mensualidadesSecr.html');
});
app.get('/secretario/mensualidades/meses', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/btn_meses.html');
});
app.get('/secretario/mensualidades/meses/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/btn_registrar_meses.html');
});
app.get('/secretario/mensualidades/meses/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/btn_editar_mes.html');
});
app.get('/secretario/mensualidades/deudores', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/btn_lista_deudores.html');
});
app.get('/secretario/mensualidades/detalles_seccion', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/modSeccionSelecDeu.html');
});



app.get('/secretario/descuentos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/descuentosSecretario/descuentosSecretario.html');
});
app.get('/secretario/descuentos/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/descuentosSecretario/btn_crear_descuentos.html');
});
app.get('/secretario/descuentos/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/descuentosSecretario/btn_editar_descuento.html');
});

app.get('/secretario/definir_monto', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/defMontoSecretario/defMontoSecr.html');
})
app.get('/secretario/definir_monto/crear', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/defMontoSecretario/btn_crearMonto.html');
})
app.get('/secretario/definir_monto/editar', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/defMontoSecretario/btn_editMonto.html');
})
app.get('/secretario/pagos', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/pagosSecretario/pagosSecretario.html');
})
app.get('/secretario/pagos/registrar_pago', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/pagosSecretario/btn_registrar_pago.html');
})



const PORT = process.env.BACKEND_PORT ;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});