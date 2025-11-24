import { PrismaClient } from '@prisma/client';
// Tạo 1 instance duy nhất
export const prisma = new PrismaClient();
// Hàm connect DB — gọi khi app khởi động
export async function connectDB() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to MySQL database successfully!');
    }
    catch (error) {
        console.error('❌ Failed to connect to database:', error);
        process.exit(1);
    }
}
