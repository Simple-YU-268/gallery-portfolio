import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteImageFiles } from '@/lib/image'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get('authorization')
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const photo = await prisma.photo.findUnique({ where: { id: params.id } })
    if (!photo) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await deleteImageFiles({
      originalPath: photo.originalPath,
      thumbnailPath: photo.thumbnailPath,
      mediumPath: photo.mediumPath,
      largePath: photo.largePath,
    })

    await prisma.photo.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get('authorization')
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const photo = await prisma.photo.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        seriesId: body.seriesId,
        order: body.order,
        isPublished: body.isPublished,
      },
    })
    return NextResponse.json(photo)
  } catch (e) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
