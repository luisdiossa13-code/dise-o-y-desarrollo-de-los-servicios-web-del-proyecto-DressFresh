const router = require('express').Router();
const { body } = require('express-validator');
const {
  listMethods,
  createPayment,
  listMyPayments,
  listAllPayments,
  getPayment,
  confirmPayment,
  refundPayment
} = require('../controllers/paymentsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.get('/methods', asyncHandler(listMethods));

router.post(
  '/',
  requireAuth,
  [
    body('orderId').trim().notEmpty().withMessage('orderId es obligatorio.'),
    body('method').trim().notEmpty().withMessage('method es obligatorio.')
  ],
  handleValidation,
  asyncHandler(createPayment)
);

router.get('/', requireAuth, asyncHandler(listMyPayments));
router.get('/admin-payments', requireAuth, requireAdmin, asyncHandler(listAllPayments));
router.get('/:id', requireAuth, asyncHandler(getPayment));

router.post('/:id/confirm', requireAuth, requireAdmin, asyncHandler(confirmPayment));
router.post('/:id/refund', requireAuth, requireAdmin, asyncHandler(refundPayment));

module.exports = router;