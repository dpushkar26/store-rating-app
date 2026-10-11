const prisma = require('../config/db');

const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Verify the owner exists and has the STORE_OWNER role
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== 'STORE_OWNER') {
      return res.status(400).json({ message: 'Invalid owner ID or user is not a STORE_OWNER' });
    }

    const existingStore = await prisma.store.findFirst({
      where: { OR: [{ email }, { ownerId }] }
    });

    if (existingStore) {
      return res.status(409).json({ message: 'Store with this email or owner already exists' });
    }

    const store = await prisma.store.create({
      data: { name, email, address, ownerId }
    });

    return res.status(201).json(store);
  } catch (error) {
    console.error('[Create Store Error]:', error);
    return res.status(500).json({ message: 'Error creating store' });
  }
};

const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', order = 'asc' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const whereClause = {};
    if (name) whereClause.name = { contains: name, mode: 'insensitive' };
    if (email) whereClause.email = { contains: email, mode: 'insensitive' };
    if (address) whereClause.address = { contains: address, mode: 'insensitive' };

    // Determine valid Prisma orderBy fields
    const validPrismaSortFields = ['name', 'email', 'address', 'createdAt'];
    const prismaOrderBy = validPrismaSortFields.includes(sortBy) 
      ? { [sortBy]: order === 'asc' ? 'asc' : 'desc' }
      : { name: 'asc' };

    const stores = await prisma.store.findMany({
      where: whereClause,
      orderBy: prismaOrderBy,
      include: {
        ratings: true // Include all ratings to calculate average
      }
    });

    let processedStores = stores.map(store => {
      let totalScore = 0;
      let myRating = null;

      store.ratings.forEach(r => {
        totalScore += r.score;
        if (r.userId === userId) {
          myRating = r.score;
        }
      });

      const averageRating = store.ratings.length > 0 
        ? (totalScore / store.ratings.length).toFixed(1) 
        : 0;

      // Remove the raw ratings array from the response to save bandwidth
      const { ratings, ...storeData } = store;

      const responseData = {
        ...storeData,
        averageRating: parseFloat(averageRating)
      };

      // Only Normal Users need to see their specific submitted rating
      if (userRole === 'NORMAL_USER') {
        responseData.myRating = myRating;
      }

      return responseData;
    });

    // If sorting by rating, sort in-memory
    if (sortBy === 'rating' || sortBy === 'averageRating') {
      processedStores.sort((a, b) => 
        order === 'asc' ? a.averageRating - b.averageRating : b.averageRating - a.averageRating
      );
    }

    return res.status(200).json(processedStores);
  } catch (error) {
    console.error('[Get Stores Error]:', error);
    return res.status(500).json({ message: 'Error fetching stores' });
  }
};

module.exports = { createStore, getStores };