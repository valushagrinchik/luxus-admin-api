import { PrismaClient } from '@prisma/client';
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
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      // SeNTImUsTO
      password: '$2a$10$4YRjgnUw86k2/SZ5TXdHHOdSNsfRkbE7WAvmklyXS156un7ATXuFG',
      role: 'User',
    },
  });
  const vgAdmin = await prisma.user.upsert({
    where: { email: 'vg_admin@test.com' },
    update: {},
    create: {
      email: 'vg_admin@test.com',
      // CeRmfIGHtE
      password: '$2a$10$cqMtJJFrc3l9.14oi2cNhegt7XNlJVJhgFC5OmkjcR7t2Dr3AMgne',
      role: 'Admin',
    },
  });
  const vgUser = await prisma.user.upsert({
    where: { email: 'vg_user@test.com' },
    update: {},
    create: {
      email: 'vg_user@test.com',
      // SeNTImUsTO
      password: '$2a$10$4YRjgnUw86k2/SZ5TXdHHOdSNsfRkbE7WAvmklyXS156un7ATXuFG',
      role: 'User',
    },
  });
  console.log(admin, user, vgAdmin, vgUser);
};

async function main() {
  await seedUsers();
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
