const express = require('express');
const { submitRating } = require('../controllers/rating.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(requireAuth, requireRole(['NORMAL_USER']));

// PUT request because it acts as both create and update (idempotent)
router.put('/:storeId', submitRating);

module.exports = router;