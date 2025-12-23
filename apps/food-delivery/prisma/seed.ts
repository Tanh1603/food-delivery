import { fakerVI as faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import {
  CuisineType,
  PrismaClient,
  RestaurantStatus,
  UserRole,
} from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const clearDatabase = async () => {
  await prisma.user.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
};

async function main() {
  await prisma.$connect();

  console.log('Start clear database...');
  await await clearDatabase();

  console.log('Start seeding...');
  await seedUser();
  await seedRestaurant();

  console.log('Seed restaurtant and menu items successfully!');
  console.log('Seeding finished!');
}

const seedUser = async () => {
  const data = [];

  // Admin
  data.push({
    fullName: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    phone: '0987654321',
    password: bcrypt.hashSync('123456', 10),
  });

  // Owner
  data.push({
    fullName: 'Owner User',
    email: 'owner@example.com',
    role: UserRole.OWNER,
    phone: '0987654322',
    password: bcrypt.hashSync('123456', 10),
  });

  const usedEmails = new Set(['admin@example.com', 'owner@example.com']);
  const usedPhones = new Set(['0987654321', '0987654322']);

  // 100 Users
  for (let i = 0; i < 100; i++) {
    let email = faker.internet.email();
    let phone = faker.phone.number();

    // đảm bảo không trùng
    while (usedEmails.has(email)) {
      email = faker.internet.email();
    }
    while (usedPhones.has(phone)) {
      phone = faker.phone.number();
    }

    usedEmails.add(email);
    usedPhones.add(phone);

    data.push({
      fullName: faker.person.fullName(),
      email,
      phone,
      role: UserRole.USER,
      password: bcrypt.hashSync('123456', 10),
    });
  }

  await prisma.user.createMany({
    data,
    skipDuplicates: true,
  });

  console.log('✅ Created Admin, Owner and 100 users without duplicates');
};

const seedRestaurant = async () => {
  const cuisineType = faker.helpers.arrayElement(Object.values(CuisineType));

  for (let i = 0; i < 10; i++) {
    const restaurantName = `Quán ăn ${i}`;
    const restaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName,
        address: faker.location.streetAddress(),
        lat: Number(faker.location.latitude()),
        lng: Number(faker.location.longitude()),
        rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        cuisineType: cuisineType,
        status: RestaurantStatus.ACTIVE,

        menuItems: {
          create: Array.from({ length: 15 }, (_, index) => ({
            name: `${faker.food.dish()} ${index}`,
            price: faker.number.int({ min: 20000, max: 1000000 }),
            available: true,
            inventory: faker.number.int({ min: 10, max: 60 }),
          })),
        },
      },
    });

    console.log(`✅ Created restaurant: ${restaurant.name}`);
  }
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
