const express = require('express');
const { register, login, updatePassword } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, updatePasswordSchema } = require('../schemas/auth.schema');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', login);
router.patch('/password', requireAuth, validate(updatePasswordSchema), updatePassword);

module.exports = router;