import { PrismaClient } from '@prisma/client';
import { groupBy } from 'lodash';
const prisma = new PrismaClient();

const seedUsers = async () => {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      // CeRmfIGHtE
      password: '$2a$10$cqMtJJFrc3l9.14oi2cNhegt7XNlJVJhgFC5OmkjcR7t2Dr3AMgne',
      role: 'Admin',
    },
  });
  const worker = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      // SeNTImUsTO
      password: '$2a$10$4YRjgnUw86k2/SZ5TXdHHOdSNsfRkbE7WAvmklyXS156un7ATXuFG',
      role: 'User',
    },
  });
  console.log(admin, worker);
};

const seedStubData = async () => {
  const groupPromises = [
    {
      id: 1,
      name: 'TestGroup1',
    },
    {
      id: 2,
      name: 'TestGroup2',
    },
    {
      id: 3,
      name: 'TestGroup3',
    },
    {
      id: 4,
      name: 'WWW Group',
    },
    {
      id: 5,
      name: 'DDD Group',
    },
    {
      id: 6,
      name: 'TestGroup4',
    },
    {
      id: 7,
      name: 'AAA Group',
    },
    {
      id: 8,
      name: '1234 Group',
    },
  ].map((group) =>
    prisma.group.upsert({
      where: {
        id: group.id,
      },
      update: group,
      create: group,
    }),
  );
  const categoryPromises = [
    {
      id: 1,
      name: 'CAt 2',
      groupId: 3,
    },
    {
      id: 2,
      name: 'CAt 3',
      groupId: 3,
    },
    {
      id: 3,
      name: 'AA CAt 2',
      groupId: 3,
    },
    {
      id: 4,
      name: 'CAtw 2',
      groupId: 1,
    },
    {
      id: 5,
      name: '234 CAt 33',
      groupId: 1,
    },
    {
      id: 6,
      name: 'AA CAt 22',
      groupId: 1,
    },
  ].map((category) =>
    prisma.category.upsert({
      where: {
        id: category.id,
      },
      update: category,
      create: category,
    }),
  );

  await Promise.all(groupPromises);
  await Promise.all(categoryPromises);
};

async function main() {
  await seedUsers();
  await seedStubData();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
