const router = require('express').Router();
const { getStats } = require('../controllers/dashboardController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

router.use(requireAuth, requireAdmin);
router.get('/stats', asyncHandler(getStats));

module.exports = router;