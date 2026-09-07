const router = require('express').Router();
const { body } = require('express-validator');
const {
  publicConfig,
  fullConfig,
  updateConfig,
  addSocial,
  updateSocial,
  deleteSocial,
  addBanner,
  deleteBanner
} = require('../controllers/configController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.get('/', asyncHandler(publicConfig));
router.get('/full', requireAuth, requireAdmin, asyncHandler(fullConfig));

router.put('/admin', requireAuth, requireAdmin, asyncHandler(updateConfig));

router.post(
  '/social',
  requireAuth,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('El nombre de la red es obligatorio.'),
    body('url').trim().notEmpty().withMessage('La URL es obligatoria.')
  ],
  handleValidation,
  asyncHandler(addSocial)
);

router.patch(
  '/social/:socialId',
  requireAuth,
  requireAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('url').optional().trim().notEmpty().withMessage('La URL no puede estar vacía.'),
    body('active').optional().isBoolean().withMessage('active debe ser true o false.')
  ],
  handleValidation,
  asyncHandler(updateSocial)
);

router.delete('/social/:socialId', requireAuth, requireAdmin, asyncHandler(deleteSocial));

router.post(
  '/banners',
  requireAuth,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('El título es obligatorio.'),
    body('image').trim().notEmpty().withMessage('La imagen es obligatoria.')
  ],
  handleValidation,
  asyncHandler(addBanner)
);

router.delete('/banners/:bannerId', requireAuth, requireAdmin, asyncHandler(deleteBanner));

module.exports = router;