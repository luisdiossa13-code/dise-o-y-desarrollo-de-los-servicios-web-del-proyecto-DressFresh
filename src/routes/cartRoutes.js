const router = require('express').Router();
const { body } = require('express-validator');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
} = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.use(requireAuth);

router.get('/', asyncHandler(getCart));

router.post(
  '/items',
  [
    body('productId').trim().notEmpty().withMessage('productId es obligatorio.'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('La cantidad debe ser un entero >= 1.'),
    body('size').optional().trim(),
    body('color').optional().trim()
  ],
  handleValidation,
  asyncHandler(addItem)
);

router.patch(
  '/items/:productId',
  [body('quantity').isInt({ min: 0 }).withMessage('La cantidad debe ser un entero >= 0.')],
  handleValidation,
  asyncHandler(updateItem)
);

router.delete('/items/:productId', asyncHandler(removeItem));
router.delete('/', asyncHandler(clearCart));

module.exports = router;