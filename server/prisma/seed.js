const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@storerater.com' }
  });

  if (!existingAdmin) {
    const password_hash = await bcrypt.hash('Admin@123!', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator Default',
        email: 'admin@storerater.com',
        password_hash,
        address: '123 Admin HQ Building, Server Room',
        role: 'SYSTEM_ADMIN'
      }
    });
    console.log(`Created System Admin: ${admin.email}`);
  } else {
    console.log('System Admin already exists.');
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });