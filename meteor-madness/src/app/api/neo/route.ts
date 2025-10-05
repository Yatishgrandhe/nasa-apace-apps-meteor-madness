import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0]
  const endDate = searchParams.get('end_date') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'NASA API key not found' }, { status: 500 })
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    // Fetch NEO data from NASA API
    const neoResponse = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Meteor-Madness/1.0',
          'Cache-Control': 'no-cache'
        }
      }
    )

    if (!neoResponse.ok) {
      const errorText = await neoResponse.text()
      return NextResponse.json({ 
        error: `NASA NEO API error: ${neoResponse.status} ${neoResponse.statusText} - ${errorText}` 
      }, { status: neoResponse.status })
    }

    const neoData = await neoResponse.json()

    // Extract all NEO IDs for orbital data lookup
    const allObjects = Object.values(neoData.near_earth_objects || {}).flat()
    const neoIds = allObjects.map(obj => obj.id).filter(Boolean)

    // Fetch orbital data for each NEO from JPL Small-Body Database
    const enhancedObjects = await Promise.all(
      allObjects.map(async (obj) => {
        try {
          // Fetch orbital data from JPL API
          const orbitalResponse = await fetch(
            `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${obj.id}&phys=true&full-prec=true`,
            {
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Meteor-Madness/1.0'
              }
            }
          )

          if (orbitalResponse.ok) {
            const orbitalData = await orbitalResponse.json()
            
            // Extract orbit class from JPL data
            if (orbitalData.object && orbitalData.orbit) {
              const orbitClass = orbitalData.object.class || orbitalData.orbit.class || 'Unknown'
              const orbitDescription = orbitalData.object.class_name || 
                                     orbitalData.orbit.class_name || 
                                     getOrbitClassDescription(orbitClass)
              
              // Add orbital data to the NEO object
              return {
                ...obj,
                orbital_data: {
                  orbit_class: {
                    orbit_class_type: orbitClass,
                    orbit_class_description: orbitDescription
                  },
                  last_observation_date: orbitalData.orbit.last_obs || obj.close_approach_data?.[0]?.close_approach_date || new Date().toISOString().split('T')[0]
                }
              }
            }
          }
        } catch (orbitalError) {
          console.warn(`Failed to fetch orbital data for ${obj.id}:`, orbitalError)
        }

        // Return original object with default orbital data
        return {
          ...obj,
          orbital_data: {
            orbit_class: {
              orbit_class_type: 'Unknown',
              orbit_class_description: 'Orbit class not available'
            },
            last_observation_date: obj.close_approach_data?.[0]?.close_approach_date || new Date().toISOString().split('T')[0]
          }
        }
      })
    )

    clearTimeout(timeoutId)

    // Return enhanced data with orbital information
    return NextResponse.json({
      ...neoData,
      near_earth_objects: Object.fromEntries(
        Object.entries(neoData.near_earth_objects || {}).map(([date, objects]) => [
          date,
          objects.map(obj => enhancedObjects.find(enhanced => enhanced.id === obj.id) || obj)
        ])
      )
    })

  } catch (error) {
    console.error('NEO API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch NEO data' 
    }, { status: 500 })
  }
}

// Helper function to get orbit class descriptions
function getOrbitClassDescription(orbitClass: string): string {
  const descriptions: Record<string, string> = {
    'APO': 'Apollo - Earth-crossing asteroids with semi-major axis > 1 AU',
    'ATE': 'Aten - Earth-crossing asteroids with semi-major axis < 1 AU',
    'AMO': 'Amor - Near-Earth asteroids that approach Earth\'s orbit but do not cross it',
    'ATI': 'Atira - Asteroids with orbits entirely within Earth\'s orbit',
    'LPC': 'Long Period Comet - Comets with orbital periods > 200 years',
    'SPC': 'Short Period Comet - Comets with orbital periods < 200 years',
    'HTC': 'Halley-type Comet - Comets with orbital periods 20-200 years',
    'JFC': 'Jupiter Family Comet - Short-period comets influenced by Jupiter',
    'MBA': 'Main Belt Asteroid',
    'TNO': 'Trans-Neptunian Object',
    'CEN': 'Centaur'
  }
  
  return descriptions[orbitClass] || `Unknown orbit class: ${orbitClass}`
}
