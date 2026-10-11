const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify the user still exists in the database
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User no longer exists' });
    }

    // Attach user to request object for downstream use
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' });
  }
};

module.exports = { requireAuth };