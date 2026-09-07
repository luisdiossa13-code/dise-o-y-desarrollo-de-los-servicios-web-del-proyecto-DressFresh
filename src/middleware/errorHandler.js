const { ApiError } = require('../utils/helpers');

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Tu sesión expiró. Inicia sesión nuevamente.' });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor. Intenta nuevamente más tarde.'
  });
}

module.exports = { notFound, errorHandler };