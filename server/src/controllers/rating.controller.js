const prisma = require('../config/db');

const submitRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { score } = req.body;
    const userId = req.user.id;

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Upsert rating: update if exists, otherwise create
    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: { userId, storeId }
      },
      update: { score },
      create: { userId, storeId, score }
    });

    return res.status(200).json({ message: 'Rating submitted successfully', rating });
  } catch (error) {
    console.error('[Submit Rating Error]:', error);
    return res.status(500).json({ message: 'Error submitting rating' });
  }
};

module.exports = { submitRating };