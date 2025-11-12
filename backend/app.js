// const express = require('express');
// const app = express();
// const port = 3000;

// app.get('/', (req, res) => res.send('API funcionando correctamente'));

// app.listen(port, () => {
//   console.log(`Servidor escuchando en el puerto ${port}`);
// });

//////////////////////////////////////////////////////////////
const { requireAuth, requireAuthView, requireAdmin, requireSecretario } = require('./middleware/auth.middleware');

const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// app.use(cors());

app.use(cors({
    origin: ['http://localhost:8088', 'http://localhost:3000'],
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND (antes de las rutas HTML)
app.use('/js', express.static('/usr/src/frontend/public/js'));
app.use('/css', express.static('/usr/src/frontend/public/css'));
app.use('/img', express.static('/usr/src/frontend/public/img'));

// servir scripts de API (admin y secretario)
app.use('/js/api', express.static('/usr/src/frontend/js/api'));


//////////////////////////////////////////////////////////////
// API RUTAS AUTH

const loginRoutes = require('./modules/login/login.routes');
app.use('/api/auth', loginRoutes);




//////////////////////////////////////////////////////////////
// API RUTAS 

const persAdminRoutes = require('./modules/personalAdmin/persAdmin.routes');
app.use('/api/admin/usuarios', requireAuth,persAdminRoutes);

const nivelRoutes = require('./modules/aulas_seccionesSecr/nivel.routes');
app.use('/api/niveles', requireAuth,nivelRoutes);

const gradoRoutes = require('./modules/aulas_seccionesSecr/grado.routes');
app.use('/api/grados', requireAuth, gradoRoutes);

const aulaRoutes = require('./modules/aulas_seccionesSecr/aula.routes');
app.use('/api/aulas',requireAuth , aulaRoutes);

const seccionRoutes = require('./modules/aulas_seccionesSecr/seccion.routes');
app.use('/api/secciones', requireAuth,seccionRoutes);

const anioAcademicoRoutes = require('./modules/anio_academicoSecr/anioAcademico.routes');
app.use('/api/anio_academico', requireAuth, anioAcademicoRoutes);

const periodoRoutes = require('./modules/periodo_academicoSecr/periodo.routes');
app.use('/api/periodos', requireAuth, periodoRoutes);

const matriculaRoutes = require('./modules/matriculasSecr/matricula.routes');
app.use('/api/matriculas', requireAuth, matriculaRoutes);

const estudianteRoutes = require('./modules/estudiantesSecr/estudiante.routes');
app.use('/api/estudiantes', requireAuth, estudianteRoutes);

const descuentoRoutes = require('./modules/descuentosSecr/descuento.routes');
app.use('/api/descuentos', requireAuth, descuentoRoutes);

const montoRoutes = require('./modules/defMonstosSecr/monto.routes');
app.use('/api/definir_monto', requireAuth, montoRoutes);

const pagoRoutes = require('./modules/pagosSecr/pago.routes');
app.use('/api/pagos', requireAuth, pagoRoutes);

const mensuaRoutes = require('./modules/mensualidadesSecr/mensua.routes');
app.use('/api/mensualidades', requireAuth, mensuaRoutes);

const deudoresRoutes = require('./modules/deudoresSecr/deudores.routes');
app.use('/api/deudores', requireAuth, deudoresRoutes);



//////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////
// VISTAS CON RUTAS PROTEGIDAS PARA EL ADMIN
//////////////////////////////////////////////////////////////

// Servir archivos estáticos desde la carpeta frontend
// app.use(express.static('/usr/src/frontend'));

// ruta corta para la página de estudiantes admin
app.get('/admin/perfil', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/perfilAdmin/perfilAdmin.html');
});
    
app.get('/admin/matriculas', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/matriculasAdmin/matriculasAdmin.html');
});

app.get('/admin/estudiantes', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/estudiantesAdmin/estudiantesAdmin.html');
});

app.get('/admin/estudiantes/informacion_estudiante', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/estudiantesAdmin/btn_informEstudiante.html');
});



app.get('/admin/mensualidades', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/mensualidadesAdmin.html');
});

app.get('/admin/mensualidades/meses', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/btn_meses.html');
});

app.get('/admin/mensualidades/meses/crear', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/btn_registrar_meses.html');
});
app.get('/admin/mensualidades/meses/editar', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/btn_editar_mes.html');
});

app.get('/admin/mensualidades/deudores', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/btn_lista_deudores.html');
});

app.get('/admin/mensualidades/detalles_seccion', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/modSeccionSelecDeu.html');
});



app.get('/admin/personal_administrativo', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/personalAdmin.html');
});

app.get('/admin/personal_administrativo/crear', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/btn_crearPerAdmin.html');
});

app.get('/admin/personal_administrativo/editar', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/btn_editarPerAdmin.html');
});



app.get('/admin/aulasSecciones', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasSeccionesAdmin.html');
});

app.get('/admin/aulasSecciones/grados', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/gradosAdmin/gradosAdmin.html');
});

app.get('/admin/aulasSecciones/grados/crear', requireAuthView, requireAdmin, (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/gradosAdmin/btn_crear_grado.html');
})

app.get('/admin/aulasSecciones/grados/editar', requireAuthView, requireAdmin, (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/gradosAdmin/btn_editar_grado.html');
})


app.get('/admin/aulasSecciones/niveles', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/nivelesAdmin/nivelesAdmin.html');
});

app.get('/admin/aulasSecciones/niveles/crear', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/nivelesAdmin/btn_crear_nivel.html');
});

app.get('/admin/aulasSecciones/niveles/editar', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/nivelesAdmin/btn_editar_nivel.html');
});


app.get('/admin/aulasSecciones/secciones', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionesAdmin/seccionesAdmin.html');
});

app.get('/admin/aulasSecciones/secciones/crear', requireAuthView, requireAdmin, (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionesAdmin/btn_crear_seccion.html');
})

app.get('/admin/aulasSecciones/secciones/editar', requireAuthView, requireAdmin, (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionesAdmin/btn_editar_seccion.html');

})


app.get('/admin/aulasSecciones/aulas', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasAdmin/aulasAdmin.html');
});

app.get('/admin/aulasSecciones/aulas/crear', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasAdmin/btn_crear_aula.html');
});

app.get('/admin/aulasSecciones/aulas/editar', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasAdmin/btn_editar_aula.html');
});


app.get('/admin/aulasSecciones/detalles_seccion', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionSeleccionada.html');
});



app.get('/admin/descuentos', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/descuentosAdmin/descuentosAdmin.html');
});

app.get('/admin/descuentos/crear', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/descuentosAdmin/btn_crear_descuento.html');
});

app.get('/admin/descuentos/editar', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/descuentosAdmin/btn_editar_descuento.html');
});

app.get('/admin/montos', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/montosDefinidosAdmin/montosDefinidosAdmin.html');
});

app.get('/admin/montos/crear', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/montosDefinidosAdmin/btn_crear_monto.html');
});

app.get('/admin/montos/editar', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/montosDefinidosAdmin/btn_editar_monto.html');
});

app.get('/admin/periodos', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/periodosAdmin/periodosAdmin.html');
});
app.get('/admin/periodos/crear', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/periodosAdmin/periodos_crear.html');
});
app.get('/admin/periodos/editar', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/periodosAdmin/periodo_editar.html');
});

// Puedes agregar rutas cortas para otras vistas:

// PRUEBA para editar personal admin
app.get('/admin/personal_administrativo/editar_personal', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/btn_editarPerAdmin.html');
});

app.get('/admin/mensualidades/seccion_mensualidad', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/seccionMensualidad.html');
});

app.get('/admin/anioAcademico', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/anioAcademicoAdmin/anioAcademicoAdmin.html');
});
// ----------------------------
app.get('/admin/aulasSecciones', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasSeccionesAdmin.html');
});

    app.get('/admin/aulasSecciones/niveles', requireAuthView, requireAdmin, (req, res) => {
        res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/nivelesAdmin/nivrelesAdmin.html');
    });

    app.get('/admin/aulasSecciones/grados', requireAuthView, requireAdmin, (req, res) => {
        res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/gradosAdmin/gradosAdmin.html');
    });

    app.get('/admin/aulasSecciones/secciones', requireAuthView, requireAdmin, (req, res) => {
        res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/seccionesAdmin/seccionesAdmin.html');
    });

    app.get('/admin/aulasSecciones/aulas', requireAuthView, requireAdmin, (req, res) => {
        res.sendFile('/usr/src/frontend/views/us_admin/aulasSeccionesAdmin/aulasAdmin/aulasAdmin.html');
    });

app.get('/admin/descuentos', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/descuentosAdmin/descuentosAdmin.html');
});

app.get('/admin/montosDefinidos', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/montosDefinidosAdmin/montosDefinidosAdmin.html');
});

app.get('/admin/pagos', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/pagosAdmin/pagosAdmin.html');
});

app.get('/admin/periodos', requireAuthView, requireAdmin, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/periodosAdmin/periodosAdmin.html');
});

//////////////////////////////////////////////////////////////
// VISTAS CON RUTAS PROTEGIDAS PARA EL SECRETARIO
//////////////////////////////////////////////////////////////

app.get('/secretario/perfil', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/perfilSecretario/perfilSecretario.html');
});

app.get('/secretario/aulas', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/aulasSecretario.html');
});

app.get('/secretario/aulas/grados', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_grados.html');
});     

app.get('/secretario/aulas/niveles', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_niveles.html');
});

app.get('/secretario/aulas/secciones', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_secciones.html');
});
app.get('/secretario/aulas/detalles_seccion', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/modSeccionSeleccionada.html');
});
app.get('/secretario/aulas/aulas', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_aulas.html');
});

app.get('/secretario/aulas/niveles/crear', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_nivel.html');
});
app.get('/secretario/aulas/niveles/editar', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_editar_nivel.html');
});
app.get('/secretario/aulas/aulas/crear', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_aula.html');
});
app.get('/secretario/aulas/aulas/editar', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_editar_aula.html');
});

app.get('/secretario/aulas/grados/crear', requireAuthView, requireSecretario, (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_grado.html');
})
app.get('/secretario/aulas/grados/editar', requireAuthView, requireSecretario, (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_editar_grado.html');
})
app.get('/secretario/aulas/secciones/crear', requireAuthView, requireSecretario, (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_seccion.html');
})
app.get('/secretario/aulas/secciones/editar', requireAuthView, requireSecretario, (req, res )=> {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_editar_seccion.html');
})

app.get('/secretario/matriculas', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/matriculasSecretario/matriculasSecretario.html');
});
app.get('/secretario/matriculas/editar', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/matriculasSecretario/btn_EditarMat.html');
});

app.get('/secretario/registrar_matricula', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/matriculasSecretario/registrarMatSecretario.html');
});



app.get('/secretario/estudiantes', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/estudSecretario/estudSecretario.html');
});

app.get('/secretario/estudiantes/informacion_estudiante', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/estudSecretario/btn_informEstudiante.html');
});
app.get('/secretario/anio_academico', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/anioAcadSecretario/anio_academico.html');
});
app.get('/secretario/anio_academico/crear', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/anioAcadSecretario/anio_academico_crear.html');
});
app.get('/secretario/anio_academico/editar', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/anioAcadSecretario/anio_academico_editar.html');
});
app.get('/secretario/periodos', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/periodoSecretario/periodos.html');
});
app.get('/secretario/periodos/crear', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/periodoSecretario/periodos_crear.html');
});
app.get('/secretario/periodos/editar', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/periodoSecretario/periodo_editar.html');
});



app.get('/secretario/mensualidades', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/mensualidadesSecr.html');
});
app.get('/secretario/mensualidades/meses', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/btn_meses.html');
});
app.get('/secretario/mensualidades/meses/crear', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/btn_registrar_meses.html');
});
app.get('/secretario/mensualidades/meses/editar', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/btn_editar_mes.html');
});
app.get('/secretario/mensualidades/deudores', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/btn_lista_deudores.html');
});
app.get('/secretario/mensualidades/detalles_seccion', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/mensSecretario/modSeccionSelecDeu.html');
});



app.get('/secretario/descuentos', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/descuentosSecretario/descuentosSecretario.html');
});
app.get('/secretario/descuentos/crear', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/descuentosSecretario/btn_crear_descuentos.html');
});
app.get('/secretario/descuentos/editar', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/descuentosSecretario/btn_editar_descuento.html');
});

app.get('/secretario/definir_monto', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/defMontoSecretario/defMontoSecr.html');
})
app.get('/secretario/definir_monto/crear', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/defMontoSecretario/btn_crearMonto.html');
})
app.get('/secretario/definir_monto/editar', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/defMontoSecretario/btn_editMonto.html');
})
app.get('/secretario/pagos', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/pagosSecretario/pagosSecretario.html');
})
app.get('/secretario/pagos/registrar_pago', requireAuthView, requireSecretario, (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/pagosSecretario/btn_registrar_pago.html');
})



const PORT = process.env.BACKEND_PORT ;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});