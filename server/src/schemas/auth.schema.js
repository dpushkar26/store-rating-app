const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(20, 'Name must be at least 20 characters')
      .max(60, 'Name cannot exceed 60 characters'),
    email: z.string().email('Invalid email address format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password cannot exceed 16 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    address: z.string()
      .max(400, 'Address cannot exceed 400 characters')
      .optional(),
    role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password cannot exceed 16 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  updatePasswordSchema
};