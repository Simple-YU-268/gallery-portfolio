import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const series = await prisma.series.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { photos: true } } },
  })
  return NextResponse.json(series)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const series = await prisma.series.create({
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle || null,
        description: body.description || null,
        order: body.order || 0,
        isPublished: body.isPublished || false,
      },
    })
    return NextResponse.json(series)
  } catch (e) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
