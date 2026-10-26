import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs/promises'
import * as path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(UPLOAD_DIR, ...params.path)
    
    // Security: ensure path is within UPLOAD_DIR
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const file = await fs.readFile(resolved)
    const ext = path.extname(resolved).toLowerCase()
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    }

    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
