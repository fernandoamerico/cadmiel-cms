'use client'
import React from 'react'

export const MediaThumbnailCell: React.FC<any> = (props) => {
  const { rowData } = props
  
  // Tenta obter a URL da imagem. 
  // Em alguns casos o Payload retorna /api/media/file/..., 
  // mas se estivermos em desenvolvimento local e o arquivo estiver em public/media,
  // a URL correta para o navegador pode ser apenas /media/...
  let src = rowData.url || rowData.thumbnailURL
  
  if (src && src.startsWith('/api/media/file/')) {
    // Fallback: se a URL for o endpoint de API que pode estar quebrado no admin local,
    // tentamos usar o caminho estático.
    src = src.replace('/api/media/file/', '/media/')
  }

  if (!src) {
    return <div style={{ 
      width: '40px', 
      height: '40px', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      borderRadius: '4px',
      fontSize: '10px',
      color: '#9ca3af'
    }}>N/A</div>
  }

  return (
    <div style={{ 
      width: '50px', 
      height: '50px', 
      overflow: 'hidden', 
      borderRadius: '4px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <img 
        src={src} 
        alt={rowData.alt || 'Thumbnail'} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
        }}
        onError={(e) => {
          // Se falhar, tenta um último fallback removendo o prefixo se existir
          const target = e.target as HTMLImageElement
          if (src.startsWith('/media/')) {
             // tenta sem o prefixo /media/ se for o caso
             target.src = src.replace('/media/', '/')
          }
        }}
      />
    </div>
  )
}
