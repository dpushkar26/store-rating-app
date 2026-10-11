const prisma = require('../config/db');
const { hashPassword, verifyPassword, generateToken } = require('../utils/auth');

const register = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if user already exists to prevent duplicate key errors
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const password_hash = await hashPassword(password);

    // Default to NORMAL_USER if role isn't provided or is invalid
    const assignedRole = role && ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role) 
      ? role 
      : 'NORMAL_USER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        address,
        role: assignedRole
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true // Exclude password_hash from response
      }
    });

    const token = generateToken(user.id, user.role);

    return res.status(201).json({ user, token });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const password_hash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash }
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[Update Password Error]:', error);
    return res.status(500).json({ message: 'Internal server error updating password' });
  }
};

module.exports = {
  register,
  login,
  updatePassword
};