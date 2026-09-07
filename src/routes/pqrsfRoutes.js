const router = require('express').Router();
const { body } = require('express-validator');
const {
  createPQRSF,
  listMine,
  listAll,
  getById,
  getByRadicado,
  respond,
  updateEstado
} = require('../controllers/pqrsfController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.post(
  '/',
  requireAuth,
  [
    body('tipo')
      .isIn(['peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion'])
      .withMessage('Tipo PQRSF inválido.'),
    body('asunto').trim().notEmpty().withMessage('El asunto es obligatorio.'),
    body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria.')
  ],
  handleValidation,
  asyncHandler(createPQRSF)
);

router.get('/', requireAuth, asyncHandler(listMine));
router.get('/admin-pqrsf', requireAuth, requireAdmin, asyncHandler(listAll));
router.get('/radicado/:radicado', requireAuth, asyncHandler(getByRadicado));
router.get('/:id', requireAuth, asyncHandler(getById));

router.patch(
  '/:id/respond',
  requireAuth,
  requireAdmin,
  [body('respuesta').trim().notEmpty().withMessage('La respuesta es obligatoria.')],
  handleValidation,
  asyncHandler(respond)
);

router.patch(
  '/:id/estado',
  requireAuth,
  requireAdmin,
  [body('estado').isIn(['recibida', 'en_proceso', 'resuelta']).withMessage('Estado PQRSF inválido.')],
  handleValidation,
  asyncHandler(updateEstado)
);

module.exports = router;