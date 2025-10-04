import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(
      `https://ssd-api.jpl.nasa.gov/sbdb_query.api?sb-class=C&limit=50&format=json`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Meteor-Madness/1.0',
          'Cache-Control': 'no-cache'
        }
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ 
        error: `JPL Comet API error: ${response.status} ${response.statusText} - ${errorText}` 
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Comet API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch comet data' 
    }, { status: 500 })
  }
}
