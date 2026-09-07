const db = require('../db/Database');
const { ApiError, uid, now, sequenceCode, nextSequence } = require('../utils/helpers');

const TYPES = ['peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion'];
const ESTADOS = ['recibida', 'en_proceso', 'resuelta'];

function toDTO(pqrsf) {
  if (!pqrsf) return null;
  const user = db.collection('users').findById(pqrsf.userId);
  return { ...pqrsf, user: user ? { id: user.id, name: user.name, email: user.email } : null };
}

function createPQRSF(req, res) {
  const { tipo, asunto, descripcion } = req.body;
  if (!TYPES.includes(tipo)) {
    throw new ApiError(400, `Tipo inválido. Válidos: ${TYPES.join(', ')}.`);
  }
  if (!asunto || !descripcion) {
    throw new ApiError(400, 'El asunto y la descripción son obligatorios.');
  }

  const pqrsfs = db.collection('pqrsf');
  const seq = nextSequence(pqrsfs.all(), 'sequence');
  const pqrsf = pqrsfs.create({
    id: uid('pqr'),
    sequence: seq,
    radicado: sequenceCode('PQR', seq),
    userId: req.user.id,
    tipo,
    asunto,
    descripcion,
    estado: 'recibida',
    respuesta: null,
    respondidoPor: null,
    fechaRespuesta: null,
    createdAt: now(),
    updatedAt: now()
  });

  res.status(201).json({
    success: true,
    message: '¡Solicitud recibida! Conserva tu número de radicado para dar seguimiento.',
    data: toDTO(pqrsf)
  });
}

function listMine(req, res) {
  const rows = db
    .collection('pqrsf')
    .find((p) => p.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: rows.map(toDTO) });
}

function listAll(req, res) {
  const { estado = '', tipo = '', page = 1, limit = 20 } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));

  let rows = db.collection('pqrsf').all();
  if (estado) rows = rows.filter((r) => r.estado === estado);
  if (tipo) rows = rows.filter((r) => r.tipo === tipo);
  rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = rows.length;
  const start = (p - 1) * l;
  res.json({
    success: true,
    data: rows.slice(start, start + l).map(toDTO),
    meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
  });
}

function getById(req, res) {
  const pqrsf = db.collection('pqrsf').findById(req.params.id);
  if (!pqrsf) throw new ApiError(404, 'Solicitud PQRSF no encontrada.');
  if (req.user.role !== 'admin' && pqrsf.userId !== req.user.id) {
    throw new ApiError(403, 'No tienes permisos para ver esta solicitud.');
  }
  res.json({ success: true, data: toDTO(pqrsf) });
}

function getByRadicado(req, res) {
  const pqrsf = db.collection('pqrsf').findOne((p) => p.radicado === req.params.radicado);
  if (!pqrsf) throw new ApiError(404, 'No se encontró ninguna solicitud con ese radicado.');
  if (req.user.role !== 'admin' && pqrsf.userId !== req.user.id) {
    throw new ApiError(403, 'No tienes permisos para ver esta solicitud.');
  }
  res.json({ success: true, data: toDTO(pqrsf) });
}

function respond(req, res) {
  const pqrsfs = db.collection('pqrsf');
  const pqrsf = pqrsfs.findById(req.params.id);
  if (!pqrsf) throw new ApiError(404, 'Solicitud PQRSF no encontrada.');
  if (!req.body.respuesta || !String(req.body.respuesta).trim()) {
    throw new ApiError(400, 'La respuesta es obligatoria.');
  }

  const updated = pqrsfs.update(pqrsf.id, {
    respuesta: String(req.body.respuesta).trim(),
    respondidoPor: req.user.id,
    estado: 'resuelta',
    fechaRespuesta: now(),
    updatedAt: now()
  });
  res.json({ success: true, message: 'Respuesta registrada. La solicitud quedó resuelta.', data: toDTO(updated) });
}

function updateEstado(req, res) {
  const pqrsfs = db.collection('pqrsf');
  const pqrsf = pqrsfs.findById(req.params.id);
  if (!pqrsf) throw new ApiError(404, 'Solicitud PQRSF no encontrada.');

  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) {
    throw new ApiError(400, `Estado inválido. Válidos: ${ESTADOS.join(', ')}.`);
  }
  const updated = pqrsfs.update(pqrsf.id, { estado, updatedAt: now() });
  res.json({ success: true, message: 'Estado actualizado.', data: toDTO(updated) });
}

module.exports = { createPQRSF, listMine, listAll, getById, getByRadicado, respond, updateEstado, TYPES, ESTADOS };