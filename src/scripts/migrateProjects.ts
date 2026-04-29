
import { getPayload } from 'payload'
import config from '../../payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function downloadImage(url: string, dest: string) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  fs.writeFileSync(dest, buffer)
}

function mapCategory(cat: string): string {
  const c = cat?.toLowerCase() || ''
  if (c.includes('resid')) return 'residencial'
  if (c.includes('comerc') || c.includes('galp')) return 'comercial'
  if (c.includes('corp')) return 'corporativo'
  if (c.includes('design') || c.includes('inter')) return 'design'
  return 'residencial' // default
}

async function run() {
  console.log('🚀 Iniciando Migração...')
  const payload = await getPayload({ config })

  const jsonPath = path.resolve(process.cwd(), 'projects-dump.json')
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Arquivo projects-dump.json não encontrado.`)
  }

  const projects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  for (const project of projects) {
    console.log(`\n📦 Processando projeto: ${project.title}`)

    // 1. Upload Images
    const upload = async (url: string, label: string) => {
      if (!url) return null
      try {
        const ext = url.split('.').pop() || 'webp'
        const filename = `${project.slug}-${label}-${Date.now()}.${ext}`
        const tempPath = path.resolve(__dirname, filename)
        
        console.log(`  🖼️  Baixando ${label}...`)
        await downloadImage(url, tempPath)
        
        console.log(`  📤 Enviando ${label} para o Payload...`)
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: `${project.title} - ${label}`,
          },
          filePath: tempPath,
        })
        
        fs.unlinkSync(tempPath)
        return media.id
      } catch (err) {
        console.error(`  ❌ Erro no upload de ${label}:`, err.message)
        return null
      }
    }

    const coverId = await upload(project.cover_img, 'cover')
    const mainId = await upload(project.main_img || project.banner_img, 'main')
    
    const galleryIds = []
    if (project.gallery_imgs) {
      for (let i = 0; i < project.gallery_imgs.length; i++) {
        const id = await upload(project.gallery_imgs[i], `gallery-${i}`)
        if (id) galleryIds.push({ image: id })
      }
    }

    const detailIds = []
    if (project.detail_imgs) {
      for (let i = 0; i < project.detail_imgs.length; i++) {
        const id = await upload(project.detail_imgs[i], `detail-${i}`)
        if (id) detailIds.push({ image: id })
      }
    }

    // 2. Convert RichText
    const toLexical = async (html: string) => {
      if (!html) return null
      // convertMarkdownToLexical actually handles simple HTML well enough or we can just pass it
      // For now, we use it as a bridge.
      return await convertMarkdownToLexical({
        editorConfig,
        markdown: html, // Assuming it's simple enough
      })
    }

    const desc1 = await toLexical(project.description_long1)
    const desc2 = await toLexical(project.description_long2)
    const challenge = await toLexical(project.challenge || project.challenge_text)
    const solution = await toLexical(project.solution || project.solution_text)

    // 3. Create Project
    console.log(`  📝 Criando registro do projeto...`)
    await payload.create({
      collection: 'projects',
      data: {
        title: project.title,
        slug: project.slug,
        category: mapCategory(project.category1),
        descriptionShort: project.description_short,
        coverImage: coverId,
        mainImage: mainId,
        descriptionLong1: desc1,
        descriptionLong2: desc2,
        challenge: challenge,
        solution: solution,
        location: project.location,
        projectStatus: project.status_text || project.project_status,
        services: project.services,
        collaborators: project.collaborators || `Cliente: ${project.client || ''}, Área: ${project.area || ''}, Ano: ${project.year || ''}`,
        gallery: galleryIds,
        detailImages: detailIds,
        status: 'published',
        sortOrder: project.sort_order || 0,
      },
    })
    
    console.log(`  ✅ Projeto ${project.title} migrado com sucesso!`)
  }

  console.log('\n✨ Migração concluída!')
  process.exit(0)
}

run().catch(err => {
  console.error('💥 Erro fatal na migração:', err)
  process.exit(1)
})
