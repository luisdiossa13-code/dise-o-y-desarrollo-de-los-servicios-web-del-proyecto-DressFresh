const router = require('express').Router();
const { body } = require('express-validator');
const {
  listOffers,
  listAllOffersAdmin,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  calculateOffer
} = require('../controllers/offersController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.get('/', asyncHandler(listOffers));
router.get('/admin-offers', requireAuth, requireAdmin, asyncHandler(listAllOffersAdmin));
router.get('/:id', asyncHandler(getOffer));

router.post(
  '/calculate',
  [body('productIds').isArray({ min: 1 }).withMessage('productIds debe ser un arreglo no vacío.')],
  handleValidation,
  asyncHandler(calculateOffer)
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('El título es obligatorio.'),
    body('discountPercent').isInt({ min: 1, max: 100 }).withMessage('El descuento debe estar entre 1 y 100.'),
    body('scopeType').optional().isIn(['product', 'category', 'global']).withMessage('scopeType inválido.')
  ],
  handleValidation,
  asyncHandler(createOffer)
);

router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  [
    body('discountPercent').optional().isInt({ min: 1, max: 100 }).withMessage('El descuento debe estar entre 1 y 100.'),
    body('scopeType').optional().isIn(['product', 'category', 'global']).withMessage('scopeType inválido.')
  ],
  handleValidation,
  asyncHandler(updateOffer)
);

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteOffer));

module.exports = router;