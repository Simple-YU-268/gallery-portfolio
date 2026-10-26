import sharp from 'sharp'
import * as path from 'path'
import * as fs from 'fs/promises'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')

export interface ProcessedImage {
  originalPath: string
  thumbnailPath: string
  mediumPath: string
  largePath: string
  width: number
  height: number
  fileSize: number
  format: string
}

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.mkdir(path.join(UPLOAD_DIR, 'originals'), { recursive: true })
  await fs.mkdir(path.join(UPLOAD_DIR, 'thumbnails'), { recursive: true })
  await fs.mkdir(path.join(UPLOAD_DIR, 'medium'), { recursive: true })
  await fs.mkdir(path.join(UPLOAD_DIR, 'large'), { recursive: true })
}

export async function processImage(
  buffer: Buffer,
  filename: string
): Promise<ProcessedImage> {
  await ensureUploadDir()

  const ext = path.extname(filename).toLowerCase().replace('.', '') || 'jpg'
  const baseName = path.basename(filename, path.extname(filename))
  const timestamp = Date.now()
  const safeName = `${baseName}-${timestamp}`.replace(/[^a-zA-Z0-9-_]/g, '_')

  // Get metadata
  const metadata = await sharp(buffer).metadata()
  const width = metadata.width || 0
  const height = metadata.height || 0

  // Save original
  const originalPath = `originals/${safeName}.${ext}`
  await fs.writeFile(path.join(UPLOAD_DIR, originalPath), buffer)

  // Generate thumbnails
  const thumbnailPath = `thumbnails/${safeName}.webp`
  await sharp(buffer)
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(UPLOAD_DIR, thumbnailPath))

  // Medium (1200px)
  const mediumPath = `medium/${safeName}.webp`
  await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path.join(UPLOAD_DIR, mediumPath))

  // Large (2400px)
  const largePath = `large/${safeName}.webp`
  await sharp(buffer)
    .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(path.join(UPLOAD_DIR, largePath))

  const stats = await fs.stat(path.join(UPLOAD_DIR, originalPath))

  return {
    originalPath,
    thumbnailPath,
    mediumPath,
    largePath,
    width,
    height,
    fileSize: stats.size,
    format: ext,
  }
}

export async function deleteImageFiles(paths: {
  originalPath?: string | null
  thumbnailPath?: string | null
  mediumPath?: string | null
  largePath?: string | null
}) {
  for (const p of Object.values(paths)) {
    if (p) {
      try {
        await fs.unlink(path.join(UPLOAD_DIR, p))
      } catch (e) {
        console.error(`Failed to delete ${p}:`, e)
      }
    }
  }
}
