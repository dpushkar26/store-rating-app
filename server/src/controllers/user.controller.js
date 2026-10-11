const prisma = require('../config/db');
const { hashPassword } = require('../utils/auth');

const getUsers = async (req, res) => {
  try {
    // Extract query params for filtering and sorting
    const { name, email, address, role, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build the dynamic WHERE clause based on provided filters
    const whereClause = {};
    if (name) whereClause.name = { contains: name, mode: 'insensitive' };
    if (email) whereClause.email = { contains: email, mode: 'insensitive' };
    if (address) whereClause.address = { contains: address, mode: 'insensitive' };
    if (role) whereClause.role = role;

    // Safeguard Prisma orderBy so custom fields like rating don't throw an error
    const validPrismaUserFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const prismaOrderBy = validPrismaUserFields.includes(sortBy)
      ? { [sortBy]: order === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

    // Fetch users with sorting applied
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: prismaOrderBy,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        // If the user is a Store Owner, we need to fetch their store and ratings
        ownedStore: {
          select: {
            ratings: {
              select: { score: true }
            }
          }
        }
      }
    });

    // Process the data to calculate average rating for store owners
    let processedUsers = users.map(user => {
      let averageRating = null;
      if (user.role === 'STORE_OWNER' && user.ownedStore) {
        const ratings = user.ownedStore.ratings;
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, curr) => acc + curr.score, 0);
          averageRating = (sum / ratings.length).toFixed(1);
        } else {
          averageRating = 0;
        }
      }
      
      const { ownedStore, ...userData } = user;
      return { ...userData, rating: averageRating };
    });

    // If sorting by rating, sort in-memory
    if (sortBy === 'rating') {
      processedUsers.sort((a, b) => {
        const valA = a.rating !== null ? parseFloat(a.rating) : -1;
        const valB = b.rating !== null ? parseFloat(b.rating) : -1;
        return order === 'asc' ? valA - valB : valB - valA;
      });
    }

    return res.status(200).json(processedUsers);
  } catch (error) {
    console.error('[Get Users Error]:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const password_hash = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: { name, email, password_hash, address, role },
      select: { id: true, name: true, email: true, role: true }
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('[Create Admin User Error]:', error);
    return res.status(500).json({ message: 'Error creating user' });
  }
};

module.exports = {
  getUsers,
  createAdminUser
};