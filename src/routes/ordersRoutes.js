const router = require('express').Router();
const { body } = require('express-validator');
const {
  createOrder,
  listMyOrders,
  listAllOrders,
  getOrder,
  updateOrderStatus
} = require('../controllers/ordersController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.use(requireAuth);

router.post(
  '/',
  [
    body('shippingAddress').optional().trim(),
    body('phone').optional().trim(),
    body('note').optional().trim()
  ],
  handleValidation,
  asyncHandler(createOrder)
);

router.get('/', asyncHandler(listMyOrders));
router.get('/admin-orders', requireAdmin, asyncHandler(listAllOrders));
router.get('/:id', asyncHandler(getOrder));

router.patch(
  '/:id/status',
  requireAdmin,
  [
    body('status')
      .isIn(['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'])
      .withMessage('Estado de pedido inválido.')
  ],
  handleValidation,
  asyncHandler(updateOrderStatus)
);

module.exports = router;