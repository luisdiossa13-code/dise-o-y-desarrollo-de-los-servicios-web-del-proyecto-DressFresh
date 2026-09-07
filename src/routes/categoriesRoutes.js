const router = require('express').Router();
const { body } = require('express-validator');
const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoriesController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.get('/', asyncHandler(listCategories));
router.get('/:id', asyncHandler(getCategory));

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('slug').optional().trim(),
    body('active').optional().isBoolean().withMessage('active debe ser true o false.')
  ],
  handleValidation,
  asyncHandler(createCategory)
);

router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('active').optional().isBoolean().withMessage('active debe ser true o false.')
  ],
  handleValidation,
  asyncHandler(updateCategory)
);

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteCategory));

module.exports = router;