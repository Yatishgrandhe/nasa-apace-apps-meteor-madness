import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cometId } = await params

  try {
    // Mock comet data for testing
    const mockComets: Record<string, any> = {
      '1P': {
        id: '1P',
        name: '1P/Halley',
        fullname: '1P/Halley',
        type: 'comet',
        diameter: '11.2',
        h: '5.5',
        last_obs: '2024-01-15',
        pha: 'N',
        orbit_class: 'HTC',
        q: '0.587',
        Q: '35.1',
        per: '76.0',
        incl: '162.3',
        e: '0.967'
      },
      '2P': {
        id: '2P',
        name: '2P/Encke',
        fullname: '2P/Encke',
        type: 'comet',
        diameter: '4.8',
        h: '10.5',
        last_obs: '2024-02-20',
        pha: 'N',
        orbit_class: 'JFC',
        q: '0.336',
        Q: '4.09',
        per: '3.28',
        incl: '11.8',
        e: '0.848'
      },
      '9P': {
        id: '9P',
        name: '9P/Tempel',
        fullname: '9P/Tempel 1',
        type: 'comet',
        diameter: '6.0',
        h: '9.5',
        last_obs: '2024-01-10',
        pha: 'N',
        orbit_class: 'JFC',
        q: '1.54',
        Q: '4.74',
        per: '5.52',
        incl: '10.5',
        e: '0.509'
      },
      '19P': {
        id: '19P',
        name: '19P/Borrelly',
        fullname: '19P/Borrelly',
        type: 'comet',
        diameter: '8.0',
        h: '10.2',
        last_obs: '2024-03-05',
        pha: 'N',
        orbit_class: 'JFC',
        q: '1.35',
        Q: '5.84',
        per: '6.86',
        incl: '30.3',
        e: '0.624'
      },
      '67P': {
        id: '67P',
        name: '67P/Churyumov-Gerasimenko',
        fullname: '67P/Churyumov-Gerasimenko',
        type: 'comet',
        diameter: '4.1',
        h: '15.4',
        last_obs: '2024-02-15',
        pha: 'N',
        orbit_class: 'JFC',
        q: '1.24',
        Q: '5.68',
        per: '6.44',
        incl: '7.04',
        e: '0.641'
      }
    }

    let cometData = mockComets[cometId]

    // If comet not found, create a generic comet entry to prevent 404
    if (!cometData) {
      cometData = {
        id: cometId,
        name: `Comet ${cometId}`,
        fullname: `Comet ${cometId}`,
        type: 'comet',
        diameter: '5.0',
        h: '12.0',
        last_obs: new Date().toISOString().split('T')[0],
        pha: 'N',
        orbit_class: 'Unknown',
        q: '1.0',
        Q: '10.0',
        per: '10.0',
        incl: '15.0',
        e: '0.5'
      }
    }

    // Transform the data to match our frontend interface
    const transformedData = {
      id: cometData.id,
      name: cometData.fullname || cometData.name || 'Unknown Comet',
      type: 'comet',
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: cometData.diameter 
            ? parseFloat(cometData.diameter) * 0.5 
            : null,
          estimated_diameter_max: cometData.diameter 
            ? parseFloat(cometData.diameter) * 1.5 
            : null,
        }
      },
      is_potentially_hazardous_asteroid: cometData.pha === 'Y',
      absolute_magnitude_h: parseFloat(cometData.h) || null,
      orbital_data: {
        orbit_class: {
          orbit_class_type: cometData.orbit_class || 'Unknown',
          orbit_class_description: 'Comet orbital class'
        },
        last_observation_date: cometData.last_obs || null,
        perihelion_distance: cometData.q || null,
        aphelion_distance: cometData.Q || null,
        orbital_period: cometData.per || null,
        inclination: cometData.incl || null,
        eccentricity: cometData.e || null,
      },
      close_approach_data: []
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
      source: 'Mock data for testing',
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error fetching comet details:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
