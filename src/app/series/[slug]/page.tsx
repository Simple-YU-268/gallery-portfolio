import { prisma } from '@/lib/prisma'
import SeriesClient from './SeriesClient'

export const dynamic = 'force-dynamic'

export default async function SeriesPage({
  params,
}: {
  params: { slug: string }
}) {
  const series = await prisma.series.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      photos: { where: { isPublished: true }, orderBy: { order: 'asc' } },
    },
  })

  if (!series) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-neutral-500">Series not found</p></div>

  // Convert null paths to empty strings for type safety
  const safeSeries = {
    ...series,
    photos: series.photos.map(p => ({
      ...p,
      mediumPath: p.mediumPath || '',
      largePath: p.largePath || '',
      thumbnailPath: p.thumbnailPath || '',
    }))
  }

  return <SeriesClient series={safeSeries} />
}
