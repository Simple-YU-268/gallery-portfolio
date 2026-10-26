import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processImage, deleteImageFiles } from '@/lib/image'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: 'desc' },
    include: { series: { select: { title: true, slug: true } } },
  })
  return NextResponse.json(photos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const processed = await processImage(buffer, file.name)

    const photo = await prisma.photo.create({
      data: {
        title: formData.get('title') as string || file.name,
        description: formData.get('description') as string || null,
        location: formData.get('location') as string || null,
        dateTaken: formData.get('dateTaken') ? new Date(formData.get('dateTaken') as string) : null,
        camera: formData.get('camera') as string || null,
        lens: formData.get('lens') as string || null,
        settings: formData.get('settings') as string || null,
        seriesId: formData.get('seriesId') as string || null,
        order: parseInt(formData.get('order') as string) || 0,
        isPublished: formData.get('isPublished') === 'true',
        ...processed,
      },
    })

    return NextResponse.json(photo)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
