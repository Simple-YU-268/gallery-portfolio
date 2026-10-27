import { prisma } from '@/lib/prisma'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const config = await prisma.siteConfig.findUnique({ where: { id: 'site' } })

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-light mb-8 text-center">
          About
        </h1>

        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Avatar */}
          <div className="md:col-span-1">
            {config?.avatarPath ? (
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={`/api/files/${config.avatarPath}`}
                  alt={config.authorName || 'Photographer'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500">
                No avatar
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-light text-accent">
              {config?.authorName || 'Photographer'}
            </h2>
            <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
              {config?.bio || 'Photography portfolio.'}
            </p>

            {/* Social Links */}
            {config?.socialLinks && (
              <div className="flex gap-4 pt-4">
                {(() => {
                  try {
                    const links = JSON.parse(config.socialLinks)
                    return Object.entries(links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-400 hover:text-accent transition-colors"
                      >
                        {platform}
                      </a>
                    ))
                  } catch {
                    return null
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 text-center text-neutral-500 text-sm">
        <p>© {new Date().getFullYear()} {config?.authorName || 'Photographer'}</p>
      </footer>
    </main>
  )
}
