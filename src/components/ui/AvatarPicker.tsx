'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Camera, User } from 'lucide-react'

interface AvatarPickerProps {
  avatarUrl: string | null
  onFileSelect: (file: File) => Promise<void>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
}

/**
 * Selector de avatar local — usa IndexedDB, nunca sube nada a la nube.
 * Muestra un círculo con la foto o un ícono de usuario si no hay imagen.
 */
export function AvatarPicker({ avatarUrl, onFileSelect, size = 'md', className }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      await onFileSelect(file)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          sizeMap[size],
          'rounded-full overflow-hidden border-2 border-border bg-muted',
          'flex items-center justify-center relative group',
          'transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isUploading && 'opacity-60 pointer-events-none'
        )}
        aria-label="Cambiar foto de perfil"
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={avatarUrl} alt="Avatar del usuario" className="h-full w-full object-cover" />
        ) : (
          <User className="h-1/2 w-1/2 text-muted-foreground" />
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        aria-hidden="true"
      />
    </div>
  )
}
