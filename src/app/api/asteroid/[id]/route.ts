import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: asteroidId } = await params

  try {
    const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NASA API key not configured' },
        { status: 500 }
      )
    }

    // Fetch asteroid details from NASA NEO API
    const response = await fetch(
      `https://api.nasa.gov/neo/rest/v1/neo/${asteroidId}?api_key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Asteroid not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch asteroid data' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform the data for our frontend
    const transformedData = {
      id: data.id,
      name: data.name,
      diameter: data.estimated_diameter,
      is_potentially_hazardous: data.is_potentially_hazardous_asteroid,
      close_approach_data: data.close_approach_data?.map((approach: any) => ({
        close_approach_date: approach.close_approach_date,
        relative_velocity: approach.relative_velocity,
        miss_distance: approach.miss_distance,
        orbiting_body: approach.orbiting_body,
      })) || [],
      orbital_data: data.orbital_data ? {
        orbit_class: data.orbital_data.orbit_class,
        perihelion_distance: data.orbital_data.perihelion_distance,
        aphelion_distance: data.orbital_data.aphelion_distance,
        inclination: data.orbital_data.inclination,
        period_yr: data.orbital_data.orbital_period,
      } : null,
      absolute_magnitude_h: data.absolute_magnitude_h,
      estimated_diameter: data.estimated_diameter,
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
      source: 'NASA NEO API',
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error fetching asteroid details:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
