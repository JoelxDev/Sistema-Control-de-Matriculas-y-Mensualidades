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
require('dotenv').config();

// API RUTA ADMIN
app.use(express.json());
const persAdminRoutes = require('./modules/user-admin/personalAdmin/persAdmin.routes');
app.use('/api/admin',persAdminRoutes);
//////////////////////////////////////////////////////////////
// RUTAS PROTEGIDAS PARA EL ADMIN
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
app.get('/admin/matriculas/informacion_matricula', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/matriculasAdmin/btn_informMatricula.html');
});

app.get('/admin/estudiantes', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/estudiantesAdmin/estudiantesAdmin.html');
});

app.get('/admin/informacion_estudiante', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/estudiantesAdmin/btn_informEstudiante.html')
})

app.get('/admin/mensualidades', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/mensualidadesAdmin.html');
});

app.get('/admin/personal_administrativo', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/personalAdmin.html');
});

app.get('/admin/personal_administrativo/crear_personal', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/btn_crearPerAdmin.html');
});

// Puedes agregar rutas cortas para otras vistas:

// PRUEBA para editar personal admin
app.get('/admin/personal_administrativo/editar_personal', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/personalAdmin/btn_editarPerAdmin.html');
});

app.get('/admin/mensualidades/seccion_mensualidad', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_admin/mensualidadesAdmin/seccionMensualidad.html');
});

//////////////////////////////////////////////////////////////
// RUTAS PROTEGIDAS PARA EL SECRETARIO
//////////////////////////////////////////////////////////////

app.get('/secretario/perfil', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/perfilSecretario/perfilSecretario.html');
});

app.get('/secretario/aulas', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/aulasSecretario.html');
});

app.get('/secretario/aulas/crear_grado', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_grado.html');
});     

app.get('/secretario/aulas/crear_nivel', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_nivel.html');
});

app.get('/secretario/aulas/crear_seccion', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/aulasSecretario/btn_crear_seccion.html');
});

app.get('/secretario/matriculas', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/matriculasSecretario/matriculasSecretario.html');
});
app.get('/secretario/matriculas/mas_informacion', (req, res) => {
    res.sendFile('/usr/src/frontend/views/us_secretario/matriculasSecretario/btn_masInformacionMat.html');
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

const PORT = process.env.BACKEND_PORT ;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});