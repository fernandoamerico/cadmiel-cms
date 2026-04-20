import type { CollectionConfig } from 'payload'
import { convertMarkdownToLexical, editorConfigFactory, EXPERIMENTAL_TableFeature } from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'publishedAt'],
    listSearchableFields: ['title', 'excerpt'],
    description: 'Artigos do blog "Mãos na Obra"',
    components: {
      views: {
        list: {
          actions: [
            '@/components/ImportPostsButton#ImportPostsButton'
          ],
        },
      },
    },
  },
  access: {
    read: ({ req }) => {
      // Public can only read published posts; admins see all
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  endpoints: [
    {
      path: '/import-markdown',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const formData = await req.formData()
          const files = formData.getAll('file') as File[]
          let count = 0

          const editorConfig = await editorConfigFactory.fromFeatures({
            config: req.payload.config,
            features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
          })

          for (const file of files) {
            const content = await file.text()
            
            // Heurística de extração (Python-like ou Markdown simples)
            const meta = ((text: string) => {
              const tituloM = text.match(/titulo\s*=\s*["'](.*?)["']/)
              const slugM = text.match(/slug\s*=\s*["'](.*?)["']/)
              const catM = text.match(/category\s*=\s*["'](.*?)["']/)
              const contentM = text.match(/conteudo_markdown\s*=\s*f?["']{3}([\s\S]*?)["']{3}/)
              const seoTitleM = text.match(/"title":\s*f?["'](.*?)["']/)
              const seoDescM = text.match(/"description":\s*f?["'](.*?)["']/)

              if (tituloM && contentM) {
                return {
                  title: tituloM[1],
                  slug: slugM?.[1],
                  category: catM?.[1] || 'Novidades',
                  markdown: contentM[1].replace(/\{titulo\}/g, tituloM[1]),
                  seo: { title: seoTitleM?.[1], description: seoDescM?.[1] }
                }
              }

              // Markdown com Frontmatter simplificado
              const fmMatch = text.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/)
              if (fmMatch) {
                const yaml = fmMatch[1]
                const getVal = (key: string) => {
                  const m = yaml.match(new RegExp(`${key}:\\s*["']?(.*?)["']?(\\n|$)`))
                  return m ? m[1] : undefined
                }
                return {
                  title: getVal('title') || file.name.replace(/\.md$/, ''),
                  slug: getVal('slug'),
                  category: getVal('category') || 'Novidades',
                  markdown: fmMatch[2].trim(),
                  seo: { title: getVal('seo_title'), description: getVal('seo_description') }
                }
              }

              return {
                title: text.split('\n')[0].replace(/^#\s*/, '').trim() || file.name,
                markdown: text
              }
            })(content)

            const lexicalContent = await convertMarkdownToLexical({
              editorConfig,
              markdown: meta.markdown,
            })

            await req.payload.create({
              collection: 'posts',
              data: {
                title: meta.title,
                slug: meta.slug || undefined, // Deixa o hook gerar se vazio
                status: 'draft',
                category: meta.category,
                content: lexicalContent,
                seo: meta.seo?.title || meta.seo?.description ? {
                  title: meta.seo.title,
                  description: meta.seo.description,
                } : undefined,
              },
            })
            count++
          }

          return Response.json({ success: true, count })
        } catch (err: any) {
          console.error('[Import] Error:', err)
          return Response.json({ error: err.message }, { status: 500 })
        }
      },
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 5000,
      },
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      label: 'Slug (URL)',
      admin: {
        position: 'sidebar',
        description: 'Gerado automaticamente pelo título. Pode editar.',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (data?.title && !value) {
              return data.title
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Status',
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Data de publicação',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Deixe vazio para usar a data de hoje ao publicar.',
      },
      hooks: {
        beforeChange: [
          ({ data, value }) => {
            if (data?.status === 'published' && !value) {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem de capa',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'text',
      label: 'Categoria',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'Novidades',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Resumo',
      admin: {
        description: 'Aparece nos cards de listagem e no SEO. Máx. 160 caracteres.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Conteúdo',
      required: true,
    },
    // SEO fields
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Título para SEO',
          admin: {
            description: 'Deixe vazio para usar o título do post.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Descrição para SEO',
          admin: {
            description: 'Deixe vazio para usar o resumo do post.',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
