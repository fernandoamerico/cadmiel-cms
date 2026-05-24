import { getPayload } from 'payload';
import config from '../payload.config';

const h2Mappings = {
  // Post 1
  "1. A Inteligência Preditiva: A Casa que Pensa": "O que é a Inteligência Preditiva na Automação Residencial?",
  "2. Tecnologia Invisível: O Novo Código do Design": "Como a Tecnologia Invisível afeta o Design de Interiores?",
  "3. Gestão Energética: O Triângulo do Sol, Bateria e Conforto": "Como funciona a Gestão Energética no Alto Padrão?",
  "4. Métricas de Valorização em Maceió (Dados 2026)": "Qual a taxa de valorização de imóveis proativos em Maceió?",
  "Conclusão: O Futuro é Silencioso": "Qual é o futuro das casas de alto padrão?",

  // Post 2
  "O Novo Panorama Imobiliário de Alagoas em 2026": "Qual o novo panorama imobiliário de Alagoas para 2026?",
  "1. Pajuçara: A Consolidação do Luxo e o m² de R$ 14.220": "Por que a Pajuçara consolidou-se como bairro de luxo?",
  '2. Litoral Norte: A Fronteira da Expansão e o Conceito "Pé na Areia"': "O que torna o Litoral Norte a nova fronteira imobiliária?",
  "3. Análise Técnica: Custos de Construção e Índices (CUB-AL vs. Valor de Venda)": "Como estão os custos de construção e o CUB-AL em Alagoas?",
  "4. Veredito: Onde Alocar em 2026?": "Onde investir seu capital imobiliário em 2026?",
  "5. Veredito: Onde Alocar em 2026?": "Onde investir seu capital imobiliário em 2026?", // Just in case it was re-numbered

  // Post 3
  "O Novo Eldorado do ROI Imobiliário no Nordeste": "Qual é o novo Eldorado do ROI Imobiliário no Nordeste?",
  "1. A Matemática do Sucesso: 27% de Retorno Anual": "É possível alcançar 27% de retorno anual em Maceió?",
  "2. Jatiúca: O Coração Estratégico do Investimento": "Por que Jatiúca é o coração estratégico para locação?",
  "3. O Segredo da Compra na Planta: Desconto de até 30%": "Quais as vantagens de comprar imóveis na planta em Maceió?",
  "4. Métricas de Performance em Maceió (Dados 2026)": "Quais são as métricas de performance para locação short-stay?",
  "5. Conclusão: É hora de Alocar em Maceió": "Por que este é o momento ideal para investir em Maceió?",
  "6. Conclusão: É hora de Alocar em Maceió": "Por que este é o momento ideal para investir em Maceió?" // Just in case it was re-numbered
};

async function run() {
  try {
    const payload = await getPayload({ config });
    const posts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 100,
    });
    
    for (const post of posts.docs) {
      console.log(`Processing: ${post.title}`);
      let hasChanges = false;
      const children = post.content?.root?.children || [];
      const newChildren = [];
      
      let skipNextParagraph = false;
      
      for (const node of children) {
        if (skipNextParagraph) {
          if (node.type === 'paragraph') {
            skipNextParagraph = false; // skipped the paragraph
            hasChanges = true;
            continue;
          }
        }
      
        // Replace H2s with questions
        if (node.type === 'heading' && node.tag === 'h2') {
          const textNode = node.children[0];
          if (textNode && textNode.text) {
            const originalText = textNode.text.trim();
            if (h2Mappings[originalText]) {
              textNode.text = h2Mappings[originalText];
              hasChanges = true;
              console.log(`  - Replaced H2: "${originalText}" -> "${h2Mappings[originalText]}"`);
            }
          }
        }
        
        // Remove hallucinated H3s
        if (node.type === 'heading' && node.tag === 'h3') {
          const textNode = node.children[0];
          if (textNode && textNode.text && textNode.text.includes('Dica Profissional:')) {
            console.log(`  - Removing H3 hallucination: "${textNode.text}"`);
            skipNextParagraph = true; // skip this node and the paragraph that follows it
            hasChanges = true;
            continue;
          }
        }
        
        newChildren.push(node);
      }
      
      if (hasChanges) {
        post.content.root.children = newChildren;
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: {
            content: post.content
          }
        });
        console.log(`  -> Successfully updated!`);
        
        // Ping revalidate
        try {
          await fetch(`https://cadmielconstrutora.com/api/revalidate?slug=${post.slug}`, { method: 'POST' });
        } catch(e) {}
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
