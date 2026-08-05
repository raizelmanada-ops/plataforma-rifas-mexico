const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.config.upsert({
    where: { id: 'default' },
    update: {
      prizes: 'GMC SIERRA ACCESORIZADA + $20,000 MXN',
      drawDate: '2026-09-15',
      lotteryName: 'Lotería Nacional'
    },
    create: {
      id: 'default',
      prizes: 'GMC SIERRA ACCESORIZADA + $20,000 MXN',
      drawDate: '2026-08-14',
      lotteryName: 'Lotería Nacional'
    }
  });
  console.log("Config updated successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
