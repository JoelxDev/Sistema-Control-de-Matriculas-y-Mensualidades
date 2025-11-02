const model = require('./deudores.model');
// ...existing code...
async function listarMeses(req, res, next) {
  try {
    const meses = await model.obtenerMeses();
    res.json({ meses });
  } catch (err) {
    next(err);
  }
}
async function listarDeudoresHastaMesActual(req, res, next) {
  try {
    const params = {
      nivelId: req.query.nivelId,
      gradoId: req.query.gradoId,
      seccionId: req.query.seccionId,
      incluirFuturos: req.query.incluirFuturos === '1',
      hastaMes: req.query.hastaMes
    };
    const deudores = await model.obtenerDeudoresHastaMesActual(params);
    return res.json({ deudores });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener deudores' });
  }
}

async function listarPagosPorSeccion(req, res, next) {
  try {
    const idSeccion = Number(req.params.id);
    const { hastaMes, incluirFuturos } = req.query;
    const top = incluirFuturos === '1' ? 12 : (Number(hastaMes) || (new Date().getMonth() + 1));
    const rows = await model.obtenerPagosPorSeccion(idSeccion, top);
    res.json({ rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarMeses,
  listarDeudoresHastaMesActual,
  listarPagosPorSeccion
};