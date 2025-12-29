import * as dotenv  from 'dotenv';
dotenv.config({
  path: '../.env.local'
})
import { PrismaPg } from '@prisma/adapter-pg';
import Redis from 'ioredis';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const redis = new Redis('redis://localhost:6379');

const loadInventoryFromDB = async (
  items: { id: string; quantity: number }[],
) => {
  if (!items.length) return;

  const pipeline = redis.pipeline();
  for (const item of items) {
    pipeline.set(`inventory:${item.id}`, item.quantity);
  }
  await pipeline.exec();
};

const main = async () => {
  const menuItems = await prisma.menuItem.findMany({
    select: { id: true, inventory: true },
  });

  const batchSize = 1000;
  for (let i = 0; i < menuItems.length; i += batchSize) {
    const batch = menuItems.slice(i, i + batchSize);
    await loadInventoryFromDB(
      batch
        .filter((item) => item.inventory !== null)
        .map((item) => ({ id: item.id, quantity: item.inventory as number })),
    );
  }
};
main()
  .catch()
  .finally(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });
