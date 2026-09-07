const router = require('express').Router();
const { body } = require('express-validator');
const {
  listUsers,
  getUser,
  getUserOrders,
  createUser,
  updateUser,
  changeRole,
  resetPassword,
  deleteUser
} = require('../controllers/usersController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.use(requireAuth, requireAdmin);

router.get('/', asyncHandler(listUsers));
router.get('/:id', asyncHandler(getUser));
router.get('/:id/orders', asyncHandler(getUserOrders));

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('email').trim().isEmail().withMessage('Correo electrónico inválido.'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres.'),
    body('role').optional().isIn(['admin', 'cliente']).withMessage('El rol debe ser admin o cliente.')
  ],
  handleValidation,
  asyncHandler(createUser)
);

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('email').optional().trim().isEmail().withMessage('Correo electrónico inválido.'),
    body('active').optional().isBoolean().withMessage('active debe ser true o false.')
  ],
  handleValidation,
  asyncHandler(updateUser)
);

router.patch(
  '/:id/role',
  [body('role').isIn(['admin', 'cliente']).withMessage('El rol debe ser admin o cliente.')],
  handleValidation,
  asyncHandler(changeRole)
);

router.patch(
  '/:id/password',
  [body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres.')],
  handleValidation,
  asyncHandler(resetPassword)
);

router.delete('/:id', asyncHandler(deleteUser));

module.exports = router;