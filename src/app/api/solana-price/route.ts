import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('API route: Fetching Solana price...')
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      }
    )
    
    if (!response.ok) {
      console.error('CoinGecko response not OK:', await response.text())
      throw new Error('Failed to fetch from CoinGecko')
    }

    const data = await response.json()
    console.log('API route: Got price data:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    )
  }
} 