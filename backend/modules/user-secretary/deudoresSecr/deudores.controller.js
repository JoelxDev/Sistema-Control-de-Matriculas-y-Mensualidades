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
    const { nivelId, gradoId, seccionId, incluirFuturos, hastaMes } = req.query;
    const deudores = await model.obtenerDeudoresHastaMesActual({
      nivelId, gradoId, seccionId,
      incluirFuturos: incluirFuturos === '1' || incluirFuturos === 'true',
      hastaMes
    });
    res.json({ deudores });
  } catch (err) {
    next(err);
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