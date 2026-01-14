import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PROPERTY_TYPES, DIRECTIONS, LEGAL_STATUS } from '@/lib/constants'
import { formatPrice, formatArea } from '@/lib/utils/format'

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

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID required' },
        { status: 400 }
      )
    }

    // Get property details
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('owner_id', user.id)
      .single()

    if (fetchError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Build property context
    const propertyType = PROPERTY_TYPES[property.property_type as keyof typeof PROPERTY_TYPES]
    const direction = property.direction ? DIRECTIONS[property.direction as keyof typeof DIRECTIONS] : null
    const legal = property.legal_status ? LEGAL_STATUS[property.legal_status as keyof typeof LEGAL_STATUS] : null

    const context = `
Bạn là chuyên gia bất động sản tại Việt Nam. Hãy viết mô tả hấp dẫn cho BĐS sau:

Thông tin BĐS:
- Tiêu đề: ${property.title}
- Loại: ${propertyType}
- Giá: ${formatPrice(property.price)}${property.is_negotiable ? ' (thương lượng)' : ''}
- Diện tích: ${property.area ? formatArea(property.area) : 'Chưa cập nhật'}
- Phòng ngủ: ${property.bedrooms || 'Chưa cập nhật'}
- Phòng tắm: ${property.bathrooms || 'Chưa cập nhật'}
- Số tầng: ${property.floors || 'Chưa cập nhật'}
- Mặt tiền: ${property.frontage ? `${property.frontage}m` : 'Chưa cập nhật'}
- Hướng: ${direction || 'Chưa cập nhật'}
- Pháp lý: ${legal || 'Chưa cập nhật'}
- Khu vực: ${[property.street, property.ward, property.district].filter(Boolean).join(', ') || 'Chưa cập nhật'}
- Đặc điểm: ${property.features?.join(', ') || 'Chưa cập nhật'}
${property.description ? `- Mô tả gốc: ${property.description}` : ''}

Yêu cầu:
1. Viết mô tả 150-200 từ, hấp dẫn và chuyên nghiệp
2. Nhấn mạnh điểm mạnh của BĐS
3. Sử dụng ngôn ngữ bán hàng tự nhiên
4. Phù hợp với văn hóa Việt Nam
5. Không sử dụng emoji
6. Kết thúc bằng lời mời liên hệ
`

    // Check if OpenAI API key exists
    const openaiKey = process.env.OPENAI_API_KEY

    if (!openaiKey) {
      // Return a template description if no API key
      const templateDescription = generateTemplateDescription(property, propertyType, direction, legal)

      return NextResponse.json({
        success: true,
        description: templateDescription,
        source: 'template',
      })
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia viết mô tả bất động sản tại Việt Nam. Luôn viết bằng tiếng Việt, ngắn gọn và hấp dẫn.',
          },
          {
            role: 'user',
            content: context,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const description = data.choices[0]?.message?.content || ''

    // Save to database
    await supabase
      .from('properties')
      .update({ ai_description: description })
      .eq('id', propertyId)

    return NextResponse.json({
      success: true,
      description,
      source: 'openai',
    })
  } catch (error) {
    console.error('AI description error:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}

function generateTemplateDescription(
  property: Record<string, unknown>,
  propertyType: string,
  direction: string | null,
  legal: string | null
): string {
  const price = formatPrice(property.price as number)
  const area = property.area ? formatArea(property.area as number) : ''
  const location = [property.street, property.district].filter(Boolean).join(', ')

  let description = `${propertyType} ${property.title} - Cơ hội đầu tư hấp dẫn!\n\n`

  description += `Với mức giá ${price}${property.is_negotiable ? ' (có thương lượng)' : ''}, `

  if (area) {
    description += `diện tích ${area}, `
  }

  if (location) {
    description += `tọa lạc tại ${location}, `
  }

  description += `đây là lựa chọn lý tưởng `

  if (property.bedrooms && (property.bedrooms as number) >= 3) {
    description += `cho gia đình với ${property.bedrooms} phòng ngủ rộng rãi. `
  } else {
    description += `cho nhu cầu ở và đầu tư. `
  }

  if (direction) {
    description += `Hướng ${direction} đón nắng gió tự nhiên. `
  }

  if (legal) {
    description += `Pháp lý ${legal} rõ ràng, an tâm giao dịch. `
  }

  if (property.features && Array.isArray(property.features) && property.features.length > 0) {
    description += `\n\nĐặc điểm nổi bật: ${(property.features as string[]).slice(0, 4).join(', ')}. `
  }

  description += `\n\nLiên hệ ngay để được tư vấn chi tiết và sắp xếp lịch xem nhà!`

  return description
}
