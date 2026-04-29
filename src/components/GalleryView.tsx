'use client'
import React, { useState } from 'react'
import { useListContext } from '@payloadcms/ui'
import { Gutter } from '@payloadcms/ui'
import { MediaThumbnailCell } from './MediaThumbnailCell'

export const GalleryView: React.FC = () => {
  const { data, collectionSlug } = useListContext()
  const [view, setView] = useState<'table' | 'grid'>('table')

  if (collectionSlug !== 'media') return null

  const toggleView = () => setView(v => v === 'table' ? 'grid' : 'table')

  if (view === 'table') {
    return (
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={toggleView}
          style={{
            padding: '8px 16px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Mudar para Visualização em Grade (Grid)
        </button>
      </div>
    )
  }

  return (
    <Gutter>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Galeria de Mídias</h2>
        <button 
          onClick={toggleView}
          style={{
            padding: '8px 16px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Voltar para Lista
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        padding: '20px 0'
      }}>
        {data.docs?.map((doc: any) => (
          <div key={doc.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => window.location.href = `/admin/collections/media/${doc.id}`}
          >
            <div style={{ height: '200px', width: '100%', position: 'relative' }}>
               <MediaThumbnailCell rowData={doc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '10px', fontSize: '12px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {doc.filename}
              </div>
              <div style={{ color: '#6b7280' }}>
                {doc.width}x{doc.height} - {Math.round(doc.filesize / 1024)} KB
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Esconde a tabela original quando o grid está ativo */}
      <style dangerouslySetInnerHTML={{ __html: `
        .collection-list__wrap > table, 
        .collection-list__wrap > .list-controls { 
          display: none !important; 
        }
      ` }} />
    </Gutter>
  )
}
