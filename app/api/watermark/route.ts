import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'

interface WatermarkOptions {
  text: string
  phone?: string
  position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center'
  opacity: number
  fontSize?: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const optionsJson = formData.get('options') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const options: WatermarkOptions = optionsJson
      ? JSON.parse(optionsJson)
      : { text: 'BatDongSan.Digital', position: 'bottom_right', opacity: 0.8 }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata()
    const width = metadata.width || 1200
    const height = metadata.height || 800

    // Calculate watermark dimensions
    const fontSize = options.fontSize || Math.max(24, Math.floor(width / 30))
    const padding = Math.floor(width / 40)

    // Create watermark text
    const watermarkText = options.phone
      ? `${options.text}\n${options.phone}`
      : options.text

    // Calculate position
    let x = padding
    let y = padding
    let textAnchor = 'start'

    switch (options.position) {
      case 'top_right':
        x = width - padding
        textAnchor = 'end'
        break
      case 'bottom_left':
        y = height - padding - fontSize * 2
        break
      case 'bottom_right':
        x = width - padding
        y = height - padding - fontSize * 2
        textAnchor = 'end'
        break
      case 'center':
        x = width / 2
        y = height / 2
        textAnchor = 'middle'
        break
    }

    // Create SVG watermark
    const svgWatermark = `
      <svg width="${width}" height="${height}">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
          </filter>
        </defs>
        <style>
          .watermark {
            fill: rgba(255,255,255,${options.opacity});
            font-size: ${fontSize}px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            filter: url(#shadow);
          }
        </style>
        <text x="${x}" y="${y}" text-anchor="${textAnchor}" class="watermark">
          ${watermarkText.split('\n').map((line, i) =>
            `<tspan x="${x}" dy="${i === 0 ? 0 : fontSize * 1.2}">${line}</tspan>`
          ).join('')}
        </text>
      </svg>
    `

    // Apply watermark
    const watermarkedBuffer = await sharp(inputBuffer)
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'northwest',
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer()

    // Upload watermarked image
    const fileName = `${user.id}/watermarked/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`

    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, watermarkedBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload watermarked image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('Watermark error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Preview watermark (returns base64 image without saving)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const optionsJson = formData.get('options') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const options: WatermarkOptions = optionsJson
      ? JSON.parse(optionsJson)
      : { text: 'BatDongSan.Digital', position: 'bottom_right', opacity: 0.8 }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata()
    const width = metadata.width || 1200
    const height = metadata.height || 800

    // Create preview (smaller for faster response)
    const previewWidth = Math.min(width, 800)
    const previewHeight = Math.round((previewWidth / width) * height)

    const fontSize = Math.max(16, Math.floor(previewWidth / 30))
    const padding = Math.floor(previewWidth / 40)

    const watermarkText = options.phone
      ? `${options.text}\n${options.phone}`
      : options.text

    let x = padding
    let y = padding
    let textAnchor = 'start'

    switch (options.position) {
      case 'top_right':
        x = previewWidth - padding
        textAnchor = 'end'
        break
      case 'bottom_left':
        y = previewHeight - padding - fontSize * 2
        break
      case 'bottom_right':
        x = previewWidth - padding
        y = previewHeight - padding - fontSize * 2
        textAnchor = 'end'
        break
      case 'center':
        x = previewWidth / 2
        y = previewHeight / 2
        textAnchor = 'middle'
        break
    }

    const svgWatermark = `
      <svg width="${previewWidth}" height="${previewHeight}">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.5)"/>
          </filter>
        </defs>
        <style>
          .watermark {
            fill: rgba(255,255,255,${options.opacity});
            font-size: ${fontSize}px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            filter: url(#shadow);
          }
        </style>
        <text x="${x}" y="${y}" text-anchor="${textAnchor}" class="watermark">
          ${watermarkText.split('\n').map((line, i) =>
            `<tspan x="${x}" dy="${i === 0 ? 0 : fontSize * 1.2}">${line}</tspan>`
          ).join('')}
        </text>
      </svg>
    `

    const previewBuffer = await sharp(inputBuffer)
      .resize(previewWidth, previewHeight)
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'northwest',
        },
      ])
      .jpeg({ quality: 70 })
      .toBuffer()

    const base64 = previewBuffer.toString('base64')

    return NextResponse.json({
      success: true,
      preview: `data:image/jpeg;base64,${base64}`,
    })
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
