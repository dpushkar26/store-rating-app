const express = require('express');
const { getUsers, createAdminUser } = require('../controllers/user.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema } = require('../schemas/auth.schema');

const router = express.Router();

// Apply auth and admin role requirement to all routes in this file
router.use(requireAuth, requireRole(['SYSTEM_ADMIN']));

router.get('/', getUsers);
router.post('/', validate(registerSchema), createAdminUser);

module.exports = router;