const express = require('express');
const { getAdminStats, getOwnerDashboard } = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/admin', requireRole(['SYSTEM_ADMIN']), getAdminStats);
router.get('/owner', requireRole(['STORE_OWNER']), getOwnerDashboard);

module.exports = router;