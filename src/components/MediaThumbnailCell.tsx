'use client'
import React from 'react'

export const MediaThumbnailCell: React.FC<any> = (props) => {
  const { rowData } = props
  
  const src = rowData.url || rowData.thumbnailURL

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
      />
    </div>
  )
}
