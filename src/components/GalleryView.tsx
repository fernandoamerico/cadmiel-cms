'use client'
import React, { useState, useEffect } from 'react'
import { useListQuery } from '@payloadcms/ui'

export const GalleryView: React.FC = () => {
  const { collectionSlug, data: listData } = useListQuery()
  const [view, setView] = useState<'table' | 'grid'>('grid')
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Busca os docs com todos os campos (incluindo url do Vercel Blob)
  // sempre que a lista mudar (paginação, filtros, etc.)
  useEffect(() => {
    if (view !== 'grid') return
    setLoading(true)
    const total = listData?.totalDocs || 100
    fetch(`/api/media?limit=${total}&depth=0`)
      .then((r) => r.json())
      .then((json) => setDocs(json.docs || []))
      .finally(() => setLoading(false))
  }, [view, listData?.totalDocs])

  useEffect(() => {
    // Target only the table itself, not the wrapper (which also contains this component)
    const table = document.querySelector('.collection-list__wrap table')
    if (!table) return
    ;(table as HTMLElement).style.display = view === 'grid' ? 'none' : ''
  }, [view])

  if (collectionSlug !== 'media') return null

  if (view === 'table') {
    return (
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setView('grid')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          Visualizar em Grade
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: 0 }}>Galeria de Mídias</h2>
        <button
          onClick={() => setView('table')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          Voltar para Lista
        </button>
      </div>

      {loading && (
        <p style={{ color: '#aaa', marginBottom: '16px' }}>Carregando imagens...</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          paddingBottom: '32px',
        }}
      >
        {docs.map((doc: any) => (
          <div
            key={doc.id}
            onClick={() => (window.location.href = `/admin/collections/media/${doc.id}`)}
            style={{
              border: '1px solid #333',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              backgroundColor: '#111',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
                backgroundColor: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {doc.url ? (
                <img
                  src={doc.url}
                  alt={doc.alt || doc.filename}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <span style={{ color: '#555', fontSize: '12px' }}>Sem preview</span>
              )}
            </div>
            <div
              style={{
                padding: '8px 10px',
                fontSize: '11px',
                color: '#aaa',
                borderTop: '1px solid #333',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  color: '#eee',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '2px',
                }}
              >
                {doc.filename}
              </div>
              <div>
                {doc.width}x{doc.height} · {Math.round((doc.filesize || 0) / 1024)} KB
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
