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
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(
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

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ 
        error: `NASA API error: ${response.status} ${response.statusText} - ${errorText}` 
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('NEO API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch NEO data' 
    }, { status: 500 })
  }
}
