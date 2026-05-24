// no dotenv import
import { getPayload } from 'payload';
import config from '../payload.config';

async function run() {
  try {
    const payload = await getPayload({ config });
    const posts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 100,
    });
    console.log(JSON.stringify(posts.docs.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      hasAeo: !!p.aeo?.quickAnswer,
    })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
