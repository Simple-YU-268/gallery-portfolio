'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from '@/components/Lightbox'

interface Photo {
  id: string
  title: string
  location?: string | null
  description?: string | null
  mediumPath: string
  largePath: string
  camera?: string | null
  lens?: string | null
  settings?: string | null
}

interface Series {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  description?: string | null
  photos: Photo[]
}

export default function SeriesClient({ series }: { series: Series }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="relative h-[60vh] flex items-end">
        {series.photos[0] && (
          <div className="absolute inset-0">
            <Image
              src={`/api/files/${series.photos[0].largePath}`}
              alt={series.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16 w-full">
          <h1 className="text-4xl md:text-6xl font-light mb-2">
            {series.title}
          </h1>
          {series.subtitle && (
            <p className="text-xl text-white/70 font-light">{series.subtitle}</p>
          )}
        </div>
      </section>

      {/* Description */}
      {series.description && (
        <section className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-lg text-neutral-300 leading-relaxed whitespace-pre-line">
            {series.description}
          </p>
        </section>
      )}

      {/* Photo Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-[4/3] overflow-hidden bg-neutral-900 text-left"
            >
              <Image
                src={`/api/files/${photo.mediumPath}`}
                alt={photo.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <div>
                  <h3 className="text-lg font-medium">{photo.title}</h3>
                  {photo.location && (
                    <p className="text-sm text-white/70 mt-1">
                      {photo.location}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={series.photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 text-center text-neutral-500 text-sm">
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  )
}
