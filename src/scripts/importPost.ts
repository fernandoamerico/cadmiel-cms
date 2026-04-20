import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'
import config from '../../payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function run() {
  console.log('Iniciando Payload...')
  const payload = await getPayload({ config })

  const jsonPath = path.resolve(process.cwd(), 'artigo_payload_import.json')
  
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Arquivo não encontrado: ${jsonPath}. Certifique-se de rodar o script python primeiro.`)
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8')
  const postData = JSON.parse(rawData)

  console.log('Convertendo markdown em Lexical JSON...')
  
  const editorConfig = await editorConfigFactory.default({ 
    config: payload.config 
  })

  const content = await convertMarkdownToLexical({
    editorConfig,
    markdown: postData.content_markdown,
  })

  console.log('Criando post no Payload...')

  const result = await payload.create({
    collection: 'posts',
    data: {
      title: postData.title,
      slug: postData.slug,
      status: 'published', // Marcando como publicado diretamente
      category: postData.category,
      content: content,
      seo: {
        title: postData.meta.title,
        description: postData.meta.description,
      }
    },
  })

  console.log('---')
  console.log('Post criado com sucesso!')
  console.log('Título:', result.title)
  console.log('ID:', result.id)
  console.log('---')
  
  process.exit(0)
}

run().catch((err) => {
  console.error('Erro na importação:', err)
  process.exit(1)
})
