import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['coverImage', 'title', 'slug', 'category', 'status'],
    group: 'Conteúdo',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informações Básicas',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Título do Projeto',
            },
            {
              name: 'category',
              type: 'select',
              required: true,
              label: 'Categoria Principal',
              options: [
                { label: 'Residencial', value: 'residencial' },
                { label: 'Comercial', value: 'comercial' },
                { label: 'Corporativo', value: 'corporativo' },
                { label: 'Design de Interiores', value: 'design' },
              ],
              defaultValue: 'residencial',
            },
            {
              name: 'descriptionShort',
              type: 'textarea',
              label: 'Descrição Curta (Intro)',
              required: true,
              admin: {
                description: 'Aparece no carrossel da home e no topo da página do projeto.',
              },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagem de Capa (Thumbnail)',
              required: true,
            },
            {
              name: 'mainImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagem de Destaque (Banner Largo)',
              required: true,
            },
          ],
        },
        {
          label: 'Detalhes e Narrativa',
          fields: [
            {
              name: 'descriptionLong1',
              type: 'richText',
              label: 'Descrição Detalhada - Parte 1',
            },
            {
              name: 'descriptionLong2',
              type: 'richText',
              label: 'Descrição Detalhada - Parte 2',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'challenge',
                  type: 'richText',
                  label: 'O Desafio',
                  admin: { width: '50%' },
                },
                {
                  name: 'solution',
                  type: 'richText',
                  label: 'A Solução',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'challengeList',
              type: 'array',
              label: 'Tópicos do Desafio (Opcional)',
              fields: [
                {
                  name: 'item',
                  type: 'text',
                  label: 'Item da Lista',
                },
              ],
            },
          ],
        },
        {
          label: 'Dados Técnicos',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'location',
                  type: 'text',
                  label: 'Localização',
                  admin: { width: '50%' },
                },
                {
                  name: 'projectStatus',
                  type: 'text',
                  label: 'Status da Obra (ex: Concluído, Em Execução)',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'services',
                  type: 'text',
                  label: 'Serviços Prestados',
                  admin: { width: '50%' },
                },
                {
                  name: 'collaborators',
                  type: 'text',
                  label: 'Colaboradores',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Galerias',
          fields: [
            {
              name: 'gallery',
              type: 'array',
              label: 'Galeria Principal (Grid Dinâmico)',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            {
              name: 'detailImages',
              type: 'array',
              label: 'Imagens de Detalhe (Final da Página)',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
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
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Ordem de Exibição',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
