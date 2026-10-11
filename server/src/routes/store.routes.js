const express = require('express');
const { createStore, getStores } = require('../controllers/store.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(requireAuth);

// Both Admin and Normal Users can view and search stores
router.get('/', requireRole(['SYSTEM_ADMIN', 'NORMAL_USER']), getStores);

// Only Admins can create new stores
router.post('/', requireRole(['SYSTEM_ADMIN']), createStore);

module.exports = router;