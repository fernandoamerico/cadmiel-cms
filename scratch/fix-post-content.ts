import { getPayload } from 'payload';
import config from '../payload.config';

async function run() {
  try {
    const payload = await getPayload({ config });
    const posts = await payload.find({
      collection: 'posts',
      where: {
        title: {
          like: 'Guia de Bairros e Valorização em Maceió 2026'
        }
      },
      limit: 1,
    });
    
    if (posts.docs.length === 0) {
      console.log('Post not found');
      process.exit(1);
    }
    
    const post = posts.docs[0];
    const children = post.content.root.children;
    
    // Find the index of the H2 '4. Estratégias de SEO para Imóveis em 2026'
    let startIndex = -1;
    let endIndex = -1;
    
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.type === 'heading' && node.tag === 'h2') {
        const text = node.children[0]?.text;
        if (text && text.includes('4. Estratégias de SEO')) {
          startIndex = i;
          // also remove the previous horizontal rule if it exists
          if (i > 0 && children[i-1].type === 'horizontalrule') {
            startIndex = i - 1;
          }
        } else if (startIndex !== -1 && text && text.includes('5. Veredito')) {
          endIndex = i;
          break;
        }
      }
    }
    
    if (startIndex !== -1 && endIndex !== -1) {
      // Remove the nodes
      children.splice(startIndex, endIndex - startIndex);
      
      // Update the post
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          content: post.content
        }
      });
      console.log('Post updated successfully!');
    } else {
      console.log('Could not find the section to remove', { startIndex, endIndex });
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
