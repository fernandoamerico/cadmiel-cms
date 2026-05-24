import { getPayload } from 'payload';
import config from '../payload.config';

async function run() {
  try {
    const payload = await getPayload({ config });
    const posts = await payload.find({
      collection: 'posts',
      where: {
        title: {
          like: 'O Novo Panorama Imobiliário de Alagoas em 2026'
        }
      },
      limit: 1,
    });
    
    if (posts.docs.length > 0) {
      console.log(JSON.stringify(posts.docs[0].content, null, 2));
    } else {
      console.log('Post not found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
