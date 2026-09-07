const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/asyncHandler');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('email').trim().isEmail().withMessage('Correo electrónico inválido.'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres.'),
    body('phone').optional().trim(),
    body('address').optional().trim()
  ],
  handleValidation,
  asyncHandler(register)
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Correo electrónico inválido.'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.')
  ],
  handleValidation,
  asyncHandler(login)
);

router.get('/me', requireAuth, asyncHandler(me));

module.exports = router;