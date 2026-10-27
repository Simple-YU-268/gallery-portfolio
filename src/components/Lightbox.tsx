'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface LightboxProps {
  photos: Array<{
    id: string
    title: string
    location?: string | null
    description?: string | null
    largePath: string
    camera?: string | null
    lens?: string | null
    settings?: string | null
  }>
  initialIndex: number
  onClose: () => void
}

export default function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex)

  const prev = useCallback(() => {
    setCurrent((c) => (c > 0 ? c - 1 : photos.length - 1))
  }, [photos.length])

  const next = useCallback(() => {
    setCurrent((c) => (c < photos.length - 1 ? c + 1 : 0))
  }, [photos.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  const photo = photos[current]

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={48} />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center">
        <div className="relative w-full h-full flex-1 flex items-center justify-center">
          <Image
            src={`/api/files/${photo.largePath}`}
            alt={photo.title}
            width={1920}
            height={1080}
            className="max-w-full max-h-[75vh] object-contain"
            priority
          />
        </div>

        {/* Info */}
        <div className="mt-4 text-center max-w-2xl px-4">
          <h3 className="text-xl font-medium">{photo.title}</h3>
          {photo.location && (
            <p className="text-sm text-white/60 mt-1">{photo.location}</p>
          )}
          {photo.description && (
            <p className="text-sm text-white/70 mt-2 line-clamp-2">{photo.description}</p>
          )}
          {(photo.camera || photo.lens || photo.settings) && (
            <p className="text-xs text-white/40 mt-2 font-mono">
              {[photo.camera, photo.lens, photo.settings].filter(Boolean).join(' · ')}
            </p>
          )}
          <p className="text-xs text-white/30 mt-2">
            {current + 1} / {photos.length}
          </p>
        </div>
      </div>

      {/* Next */}
      {photos.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={48} />
        </button>
      )}
    </div>
  )
}
