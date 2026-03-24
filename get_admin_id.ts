
import { db } from './src/lib/db';

async function main() {
  const u = await db.user.findFirst({ where: { role: 'ADMIN' } });
  console.log(u?.id);
}

main();
