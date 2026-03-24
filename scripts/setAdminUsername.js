import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const user = await prisma.user.update({ where: { email: 'admin@vista.travel' }, data: { username: 'admin' } });
  console.log('updated:', user);
  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); process.exit(1)});
