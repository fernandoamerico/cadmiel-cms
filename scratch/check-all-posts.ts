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
    
    posts.docs.forEach(post => {
      console.log(`\n\n--- POST: ${post.title} ---`);
      console.log(JSON.stringify(post.content, null, 2));
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
