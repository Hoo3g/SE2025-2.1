import { prisma } from './config/database';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Kết nối thành công! Danh sách users:');
    console.table(users);
  } catch (error) {
    console.error('❌ Lỗi khi truy vấn database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
