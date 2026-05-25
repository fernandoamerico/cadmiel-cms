import { OpenAI } from "openai";
import * as dotenv from "dotenv";

// Importante: Carregar as variáveis de ambiente ANTES de importar o Payload
dotenv.config({ path: ".env.local" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  const args = process.argv.slice(2);
  const theme = args.join(" ");

  if (!theme) {
    console.error("Por favor, forneça um tema. Exemplo: npx tsx scratch/agent-publisher.ts Tendências de galpões logísticos em 2026");
    process.exit(1);
  }

  console.log(`🤖 Iniciando Agente AEO para o tema: "${theme}"`);

  // 1. Chamar a OpenAI para gerar o conteúdo estruturado
  const systemPrompt = `Você é um Engenheiro de SEO (AEO) e Redator Técnico Sênior da Cadmiel Construtora (Maceió/AL).
Sua missão é escrever um post de blog profundo e de alta qualidade (MÍNIMO DE 800 PALAVRAS) sobre o tema solicitado.

REGRAS RÍGIDAS DE ESTILO E ESTRUTURA:
1. NUNCA use palavras clichês de IA (ex: "em suma", "neste artigo", "mergulhe conosco", "descubra").
2. O corpo do texto (contentBlocks) deve ter no mínimo 6 tópicos profundos (H2).
3. Todo título H2 DEVE ser escrito como uma pergunta (ex: "Como a umidade afeta a estrutura do galpão?").
4. Mantenha os parágrafos densos e informativos, com dados, soluções técnicas e referências à construção de alto padrão.
5. As FAQs NÃO devem ser idênticas aos H2. As FAQs são perguntas curtas e diretas, enquanto os H2 são seções profundas do texto.

ESTRUTURA OBRIGATÓRIA (JSON):
- title: Título atraente e profissional.
- excerpt: Resumo do post de 2 a 3 linhas (para aparecer no card do blog).
- quickAnswer: Resumo de 40 a 60 palavras que responde diretamente a intenção principal do tema (focado em IA).
- faqs: Array de 4 perguntas frequentes e respostas (diferentes dos H2).
- contentBlocks: Array com o corpo do texto.
  - Use type "h2" para as perguntas principais.
  - Use "paragraph" para o desenvolvimento.
  - OBRIGATÓRIO: Inclua pelo menos 1 bloco do type "list" com os itens no array "items".
  - OBRIGATÓRIO: Inclua pelo menos 1 bloco do type "table" com comparativos de materiais ou custos no objeto "tableData".
  O texto total deve ultrapassar 800 palavras.`;

  console.log("⏳ Solicitando redação à OpenAI (pode levar uns 30 segundos)...");
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // Mudamos para gpt-4o para garantir um raciocínio complexo e textos longos
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Escreva um artigo de nível especialista (mínimo de 800 palavras) sobre: ${theme}. Desenvolva profundamente cada parágrafo.` }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "aeo_post_schema",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            excerpt: { type: "string" },
            quickAnswer: { type: "string" },
            faqs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" }
                },
                required: ["question", "answer"],
                additionalProperties: false
              }
            },
            contentBlocks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["h2", "paragraph", "list", "table"] },
                  text: { type: ["string", "null"], description: "O texto do parágrafo ou título (nulo se for lista ou tabela)" },
                  items: {
                    type: ["array", "null"],
                    items: { type: "string" },
                    description: "Array de itens da lista (nulo se não for 'list')"
                  },
                  tableData: {
                    type: ["object", "null"],
                    description: "Dados da tabela (nulo se não for 'table')",
                    properties: {
                      headers: { type: "array", items: { type: "string" } },
                      rows: {
                        type: "array",
                        items: { type: "array", items: { type: "string" } }
                      }
                    },
                    required: ["headers", "rows"],
                    additionalProperties: false
                  }
                },
                required: ["type", "text", "items", "tableData"],
                additionalProperties: false
              }
            }
          },
          required: ["title", "excerpt", "quickAnswer", "faqs", "contentBlocks"],
          additionalProperties: false
        },
        strict: true
      }
    }
  });

  const rawResult = completion.choices[0].message.content;
  if (!rawResult) {
    throw new Error("Resposta da OpenAI veio vazia.");
  }

  const generatedPost = JSON.parse(rawResult);
  console.log(`✅ Texto gerado com sucesso! Título: "${generatedPost.title}"`);

  // 2. Converter o contentBlocks para o Lexical JSON do Payload
  console.log("⚙️ Convertendo texto para o formato Lexical CMS...");
  const lexicalChildren = generatedPost.contentBlocks.map((block: any) => {
    if (block.type === "h2") {
      return {
        type: "heading",
        version: 1,
        tag: "h2",
        children: [{ type: "text", version: 1, text: block.text || "" }]
      };
    } else if (block.type === "list" && block.items) {
      return {
        type: "list",
        listType: "bullet",
        tag: "ul",
        start: 1,
        format: "",
        indent: 0,
        version: 1,
        children: block.items.map((itemText: string, index: number) => ({
          type: "listitem",
          value: index + 1,
          format: "",
          indent: 0,
          version: 1,
          children: [{ type: "text", version: 1, text: itemText }]
        }))
      };
    } else if (block.type === "table" && block.tableData) {
      return {
        type: "table",
        version: 1,
        children: [
          // Row de Cabeçalho
          {
            type: "tablerow",
            version: 1,
            children: block.tableData.headers.map((h: string) => ({
              type: "tablecell",
              headerState: 1, // 1 = header, 0 = normal
              version: 1,
              children: [{
                type: "paragraph",
                version: 1,
                children: [{ type: "text", version: 1, text: h }]
              }]
            }))
          },
          // Rows de Dados
          ...block.tableData.rows.map((row: string[]) => ({
            type: "tablerow",
            version: 1,
            children: row.map((cell: string) => ({
              type: "tablecell",
              headerState: 0,
              version: 1,
              children: [{
                type: "paragraph",
                version: 1,
                children: [{ type: "text", version: 1, text: cell }]
              }]
            }))
          }))
        ]
      };
    } else {
      return {
        type: "paragraph",
        version: 1,
        children: [{ type: "text", version: 1, text: block.text || "" }]
      };
    }
  });

  const lexicalData = {
    root: {
      type: "root",
      version: 1,
      direction: "ltr",
      format: "",
      indent: 0,
      children: lexicalChildren
    }
  };

  // 3. Salvar no Payload CMS
  console.log("💾 Salvando post no banco de dados do CMS...");
  
  // Importamos dinamicamente após as variáveis de ambiente estarem carregadas
  const { getPayload } = await import("payload");
  const config = (await import("../payload.config")).default;
  const payload = await getPayload({ config });

  // Função auxiliar para gerar um slug limpo e único
  const createSlug = (text: string) => {
    const baseSlug = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomHash = Math.random().toString(36).substring(2, 7);
    return `${baseSlug}-${randomHash}`;
  };

  const postSlug = createSlug(generatedPost.title);

  let mediaId: any = null;

  try {
    // 4. Gerar Imagem de Capa com GPT Image
    console.log("🎨 Solicitando imagem de capa ao GPT Image...");
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1-mini",
      prompt: `Uma fotografia hiper realista, profissional e de alta qualidade sobre: ${theme}. Foco em construção civil, engenharia, galpões ou arquitetura de alto padrão. Iluminação cinemática, realista, sem textos ou letras escritas na imagem.`,
      n: 1,
      size: "1024x1024"
    });

    const imageBase64 = imageResponse.data[0].b64_json;
    const imageUrl = imageResponse.data[0].url;

    let imageBuffer: Buffer | null = null;

    if (imageBase64) {
      console.log("📥 Processando a imagem gerada (Base64)...");
      imageBuffer = Buffer.from(imageBase64, "base64");
    } else if (imageUrl) {
      console.log("📥 Fazendo download da imagem gerada (URL)...");
      const imageBufferRes = await fetch(imageUrl);
      imageBuffer = Buffer.from(await imageBufferRes.arrayBuffer());
    }

    if (imageBuffer) {
      console.log("🖼️ Salvando imagem no banco de Mídias do CMS...");
      const createdMedia = await payload.create({
        collection: "media",
        data: {
          alt: generatedPost.title,
        },
        file: {
          data: imageBuffer,
          name: `${postSlug}.png`,
          mimetype: "image/png",
          size: imageBuffer.byteLength,
        }
      });
      
      mediaId = createdMedia.id;
    }
  } catch (imageError: any) {
    console.warn("\n⚠️ Aviso: Não foi possível gerar a imagem no GPT Image.");
    console.warn(`Motivo: ${imageError.message}`);
    console.warn("O post será salvo sem imagem de capa por enquanto.\n");
  }

  const createdPost = await payload.create({
    collection: "posts",
    draft: true,
    data: {
      title: generatedPost.title,
      slug: postSlug,
      featuredImage: mediaId,
      excerpt: generatedPost.excerpt,
      aeo: {
        quickAnswer: generatedPost.quickAnswer,
        faqs: generatedPost.faqs.map((f: any) => ({
          question: f.question,
          answer: f.answer
        }))
      },
      content: lexicalData as any,
      status: "draft", // No Payload v3 o campo se chama 'status' e precisamos de 'draft: true' na raiz
    }
  });

  console.log(`\n🚀 SUCESSO ABSOLUTO! Post gerado e salvo como Rascunho no painel.`);
  console.log(`Verifique o CMS: Título -> "${createdPost.title}"`);
  
  process.exit(0);
}

run().catch((error) => {
  console.error("Erro fatal:", error);
  process.exit(1);
});
