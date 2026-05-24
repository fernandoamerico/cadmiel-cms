import { getPayload } from 'payload';
import config from '../payload.config';

const updates = {
  15: {
    quickAnswer: "A casa proativa utiliza Inteligência Artificial e automação invisível para antecipar as necessidades dos moradores em imóveis de alto padrão. Ela ajusta iluminação, temperatura e segurança de forma autônoma e contínua, proporcionando conforto absoluto sem a necessidade de comandos manuais.",
    faqs: [
      { question: "O que é uma casa proativa?", answer: "É um imóvel equipado com Inteligência Artificial que aprende a rotina dos moradores para automatizar tarefas diárias de maneira invisível e eficiente." },
      { question: "Quais são os benefícios da automação inteligente no alto padrão?", answer: "Oferece maior segurança, economia de energia e um conforto incomparável, antecipando os desejos dos moradores sem exigir nenhum esforço consciente." }
    ]
  },
  13: {
    quickAnswer: "Para 2026, Maceió apresenta dois grandes polos de valorização imobiliária: a tradicional e consolidada Pajuçara, com alta liquidez turística, e o promissor Litoral Norte, que se expande rapidamente e oferece o melhor retorno financeiro para investimentos a longo prazo.",
    faqs: [
      { question: "Por que investir na Pajuçara em 2026?", answer: "A Pajuçara possui excelente infraestrutura e atrai um volume contínuo de turistas, garantindo alta liquidez e excelente rentabilidade em aluguéis de temporada." },
      { question: "O Litoral Norte de Maceió é uma boa aposta imobiliária?", answer: "Sim, a região está em franca expansão e infraestrutura crescente, recebendo novos condomínios com excelente potencial de valorização patrimonial no futuro." }
    ]
  },
  12: {
    quickAnswer: "O aluguel por temporada (short-stay) em Maceió vive um verdadeiro boom, oferecendo rentabilidades imobiliárias que superam muito a locação tradicional. A alta procura turística contínua e o crescimento de grandes plataformas digitais impulsionam fortemente esse excelente retorno financeiro.",
    faqs: [
      { question: "Vale a pena investir em imóveis para aluguel short-stay em Maceió?", answer: "Sim. A enorme demanda turística proporciona uma taxa de ocupação altíssima, o que gera uma rentabilidade muito superior à oferecida pela locação residencial padrão." },
      { question: "Como maximizar os lucros do aluguel por temporada?", answer: "Aposte em localizações altamente estratégicas perto da orla, mantenha os imóveis modernos, bem decorados e ofereça uma gestão profissional e atenciosa nas plataformas digitais." }
    ]
  }
};

async function run() {
  try {
    const payload = await getPayload({ config });
    
    for (const [id, aeo] of Object.entries(updates)) {
      await payload.update({
        collection: 'posts',
        id: parseInt(id),
        data: { aeo },
      });
      console.log(`Updated post ID ${id}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
