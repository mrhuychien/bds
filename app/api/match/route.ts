import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Match properties for a customer based on their demand
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      )
    }

    // Get customer demand
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('demand')
      .eq('id', customerId)
      .eq('owner_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const demand = customer.demand as {
      property_types?: string[]
      districts?: string[]
      budget_min?: number
      budget_max?: number
      min_area?: number
      bedrooms_min?: number
    }

    // Build query
    let query = supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id)
      .eq('status', 'available')

    // Filter by property type
    if (demand.property_types && demand.property_types.length > 0) {
      query = query.in('property_type', demand.property_types)
    }

    // Filter by district
    if (demand.districts && demand.districts.length > 0) {
      query = query.in('district', demand.districts)
    }

    // Filter by budget
    if (demand.budget_min) {
      query = query.gte('price', demand.budget_min)
    }
    if (demand.budget_max) {
      query = query.lte('price', demand.budget_max)
    }

    // Filter by area
    if (demand.min_area) {
      query = query.gte('area', demand.min_area)
    }

    // Filter by bedrooms
    if (demand.bedrooms_min) {
      query = query.gte('bedrooms', demand.bedrooms_min)
    }

    // Execute query
    const { data: properties, error } = await query
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    // Calculate match score for each property
    const scoredProperties = properties.map((property) => {
      let score = 0
      let maxScore = 0

      // Property type match (high weight)
      if (demand.property_types && demand.property_types.length > 0) {
        maxScore += 30
        if (demand.property_types.includes(property.property_type)) {
          score += 30
        }
      }

      // District match (high weight)
      if (demand.districts && demand.districts.length > 0 && property.district) {
        maxScore += 25
        if (demand.districts.includes(property.district)) {
          score += 25
        }
      }

      // Budget match (medium weight)
      if (demand.budget_min || demand.budget_max) {
        maxScore += 20
        const inBudget =
          (!demand.budget_min || property.price >= demand.budget_min) &&
          (!demand.budget_max || property.price <= demand.budget_max)
        if (inBudget) {
          score += 20
        }
      }

      // Area match (low weight)
      if (demand.min_area && property.area) {
        maxScore += 15
        if (property.area >= demand.min_area) {
          score += 15
        }
      }

      // Bedrooms match (low weight)
      if (demand.bedrooms_min && property.bedrooms) {
        maxScore += 10
        if (property.bedrooms >= demand.bedrooms_min) {
          score += 10
        }
      }

      const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100

      return {
        ...property,
        matchScore: matchPercent,
      }
    })

    // Sort by match score
    scoredProperties.sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({
      success: true,
      properties: scoredProperties,
      total: scoredProperties.length,
    })
  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Match customers for a property
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

    // Get property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('owner_id', user.id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Get customers with buying intent
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('owner_id', user.id)
      .in('customer_type', ['buyer', 'investor'])
      .not('status', 'in', ['closed', 'lost'])

    if (error) {
      throw error
    }

    // Score customers based on property match
    const scoredCustomers = customers.map((customer) => {
      const demand = customer.demand as {
        property_types?: string[]
        districts?: string[]
        budget_min?: number
        budget_max?: number
        min_area?: number
        bedrooms_min?: number
      }

      let score = 0
      let maxScore = 0

      // Property type match
      if (demand.property_types && demand.property_types.length > 0) {
        maxScore += 30
        if (demand.property_types.includes(property.property_type)) {
          score += 30
        }
      }

      // District match
      if (demand.districts && demand.districts.length > 0 && property.district) {
        maxScore += 25
        if (demand.districts.includes(property.district)) {
          score += 25
        }
      }

      // Budget match
      if (demand.budget_min || demand.budget_max) {
        maxScore += 20
        const inBudget =
          (!demand.budget_min || property.price >= demand.budget_min) &&
          (!demand.budget_max || property.price <= demand.budget_max)
        if (inBudget) {
          score += 20
        }
      }

      // Area match
      if (demand.min_area && property.area) {
        maxScore += 15
        if (property.area >= demand.min_area) {
          score += 15
        }
      }

      // Bedrooms match
      if (demand.bedrooms_min && property.bedrooms) {
        maxScore += 10
        if (property.bedrooms >= demand.bedrooms_min) {
          score += 10
        }
      }

      const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

      return {
        ...customer,
        matchScore: matchPercent,
      }
    })

    // Filter out low matches and sort
    const matchedCustomers = scoredCustomers
      .filter((c) => c.matchScore >= 50)
      .sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({
      success: true,
      customers: matchedCustomers,
      total: matchedCustomers.length,
    })
  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
