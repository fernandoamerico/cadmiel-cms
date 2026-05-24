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
    
    for (const post of posts.docs) {
      console.log(`\n--- POST: ${post.title} ---`);
      const children = post.content?.root?.children || [];
      for (const node of children) {
        if (node.type === 'heading' && node.tag === 'h2') {
          console.log(`H2: ${node.children[0]?.text}`);
        }
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
