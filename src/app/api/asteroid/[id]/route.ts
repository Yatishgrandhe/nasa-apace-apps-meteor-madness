import { NextRequest, NextResponse } from 'next/server'
import { determineOrbitClass, predictOrbitClassWithAI } from '@/lib/utils/orbitClassCalculator'

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

    // Try to get additional orbital data from JPL
    let jplData = null
    try {
      const jplResponse = await fetch(
        `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${asteroidId}&phys=true&full-prec=true`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Meteor-Madness/1.0'
          }
        }
      )
      
      if (jplResponse.ok) {
        jplData = await jplResponse.json()
      }
    } catch (jplError) {
      console.warn(`Failed to fetch JPL data for ${asteroidId}:`, jplError)
    }

    // Determine orbit class using enhanced methods
    let orbitClassification
    try {
      orbitClassification = determineOrbitClass(data, jplData)
      
      // If still unknown, try AI prediction
      if (orbitClassification.orbitClass === 'Unknown' && orbitClassification.confidence < 50) {
        console.log(`Attempting AI prediction for asteroid ${asteroidId}`)
        orbitClassification = await predictOrbitClassWithAI(data)
      }
    } catch (error) {
      console.error('Error determining orbit class:', error)
      orbitClassification = {
        orbitClass: 'Unknown',
        description: 'Orbit class could not be determined',
        confidence: 0,
        method: 'fallback',
        riskLevel: 'Low'
      }
    }

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
      orbital_data: {
        orbit_class: orbitClassification.orbitClass,
        orbit_class_description: orbitClassification.description,
        orbit_class_confidence: orbitClassification.confidence,
        orbit_class_method: orbitClassification.method,
        orbit_class_risk_level: orbitClassification.riskLevel,
        // Include original NASA data if available
        ...(data.orbital_data ? {
          original_orbit_class: data.orbital_data.orbit_class,
          perihelion_distance: data.orbital_data.perihelion_distance,
          aphelion_distance: data.orbital_data.aphelion_distance,
          inclination: data.orbital_data.inclination,
          period_yr: data.orbital_data.orbital_period,
          semi_major_axis: data.orbital_data.semi_major_axis,
          eccentricity: data.orbital_data.eccentricity,
        } : {}),
        // Include JPL data if available
        ...(jplData?.orbit ? {
          jpl_semi_major_axis: jplData.orbit.a,
          jpl_eccentricity: jplData.orbit.e,
          jpl_inclination: jplData.orbit.i,
          jpl_perihelion_distance: jplData.orbit.q,
          jpl_aphelion_distance: jplData.orbit.Q,
          jpl_period_yr: jplData.orbit.per,
        } : {})
      },
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
