const router = require('express').Router();
const { body } = require('express-validator');
const {
  listProducts,
  listAllProductsAdmin,
  getProduct,
  getProductBySlug,
  relatedProducts,
  listBrands,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

// Catálogo público
router.get('/', asyncHandler(listProducts));
router.get('/brands', asyncHandler(listBrands));
router.get('/related/:id', asyncHandler(relatedProducts));
router.get('/slug/:slug', asyncHandler(getProductBySlug));
router.get('/:id', asyncHandler(getProduct));

// Administración
router.get('/all/admin', requireAuth, requireAdmin, asyncHandler(listAllProductsAdmin));

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('price').isNumeric().withMessage('El precio debe ser un número.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero >= 0.')
  ],
  handleValidation,
  asyncHandler(createProduct)
);

router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  [
    body('price').optional().isNumeric().withMessage('El precio debe ser un número.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero >= 0.'),
    body('active').optional().isBoolean().withMessage('active debe ser true o false.')
  ],
  handleValidation,
  asyncHandler(updateProduct)
);

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteProduct));

module.exports = router;