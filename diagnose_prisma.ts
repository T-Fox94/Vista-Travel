
import { db } from './src/lib/db';

async function diagnose() {
  console.log('Prisma Client properties:', Object.keys(db));
  try {
    // @ts-ignore
    const reviews = await db.review.findMany({ take: 1 });
    console.log('Successfully accessed db.review. Data:', reviews);
  } catch (err) {
    console.error('Failed to access db.review:', err);
  }
}

diagnose();
