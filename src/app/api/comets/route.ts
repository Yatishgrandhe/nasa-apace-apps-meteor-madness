import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock comet data for testing since JPL API is unreliable
    const mockComets = [
      {
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
      {
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
      {
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
      {
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
      {
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
    ]

    return NextResponse.json({
      data: mockComets,
      count: mockComets.length,
      source: 'Mock data for testing'
    })

  } catch (error) {
    console.error('Comet API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch comet data' 
    }, { status: 500 })
  }
}
