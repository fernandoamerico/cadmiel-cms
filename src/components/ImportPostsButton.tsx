'use client'
import React, { useRef, useState } from 'react'
import { Button, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export const ImportPostsButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    const formData = new FormData()
    
    // Suporte a múltiplos arquivos
    Array.from(files).forEach((file) => {
      formData.append('file', file)
    })

    try {
      const resp = await fetch('/api/posts/import-markdown', {
        method: 'POST',
        body: formData,
      })

      const result = await resp.json()

      if (resp.ok) {
        toast.success(`${result.count} posts importados com sucesso como rascunho!`)
        // Aguarda um pouco para o toast ser visto e então atualiza a lista
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        toast.error(`Erro na importação: ${result.error || 'Erro desconhecido'}`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Ocorreu um erro ao enviar os arquivos.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="file"
        multiple
        accept=".md,.txt,.py"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        onClick={handleClick}
        disabled={loading}
        buttonStyle="secondary"
        size="small"
      >
        {loading ? 'Importando...' : 'Importar Publicações'}
      </Button>
    </div>
  )
}
