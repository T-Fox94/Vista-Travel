import { db } from './src/lib/db';

async function main() {
  const users = await db.user.findMany({ take: 5 });
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));

  const destinations = await db.destination.findMany();
  console.log('Destinations:', destinations.map(d => ({ id: d.id, title: d.title })));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
