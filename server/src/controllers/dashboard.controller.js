const prisma = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count()
    ]);

    return res.status(200).json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    console.error('[Admin Stats Error]:', error);
    return res.status(500).json({ message: 'Error fetching admin stats' });
  }
};

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: 'No store registered for this owner' });
    }

    const totalRatings = store.ratings.length;
    const sumScore = store.ratings.reduce((acc, curr) => acc + curr.score, 0);
    const averageRating = totalRatings > 0 ? (sumScore / totalRatings).toFixed(1) : 0;

    return res.status(200).json({
      storeName: store.name,
      averageRating: parseFloat(averageRating),
      totalRatings,
      recentRaters: store.ratings.map(r => ({
        userName: r.user.name,
        userEmail: r.user.email,
        score: r.score,
        date: r.createdAt
      }))
    });
  } catch (error) {
    console.error('[Owner Dashboard Error]:', error);
    return res.status(500).json({ message: 'Error fetching owner dashboard' });
  }
};

module.exports = { getAdminStats, getOwnerDashboard };