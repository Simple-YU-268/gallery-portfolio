import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [series, config] = await Promise.all([
    prisma.series.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: { photos: { take: 1, orderBy: { order: 'asc' } } },
    }),
    prisma.siteConfig.findUnique({ where: { id: 'site' } }),
  ])

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          {series[0]?.photos[0] && (
            <Image
              src={`/api/files/${series[0].photos[0].largePath}`}
              alt={series[0].title}
              fill
              className="object-cover opacity-60"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-4">
            {config?.authorName || 'Photographer'}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light max-w-2xl mx-auto">
            {config?.bio || 'Visual stories through the lens'}
          </p>
        </div>
      </section>

      {/* Series Grid */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-light mb-12 text-center">Series</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {series.map((s) => (
            <Link key={s.id} href={`/series/${s.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                {s.photos[0] ? (
                  <Image
                    src={`/api/files/${s.photos[0].mediumPath}`}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-xl font-medium">{s.title}</h3>
                  {s.subtitle && (
                    <p className="text-sm text-white/70 mt-1">{s.subtitle}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 text-center text-neutral-500 text-sm">
        <p>© {new Date().getFullYear()} {config?.authorName || 'Photographer'}</p>
      </footer>
    </main>
  )
}
