import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main(){
  const hashed = bcrypt.hashSync('29321894/Terra', 10);
  const user = await prisma.user.update({ where: { email: 'admin@vista.travel' }, data: { password: hashed } });
  console.log('updated password for:', user.email);
  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); process.exit(1)});
