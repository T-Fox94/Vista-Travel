import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const user = await prisma.user.findUnique({ where: { email: 'admin@vista.travel' }});
  console.log(user);
  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); process.exit(1)});
