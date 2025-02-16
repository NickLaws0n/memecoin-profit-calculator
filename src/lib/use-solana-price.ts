"use client"

import { useState, useEffect } from "react"

export function useSolanaPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true)
        console.log('Fetching price...')
        const response = await fetch('/api/solana-price')
        
        if (!response.ok) {
          console.error('Response not OK:', await response.text())
          throw new Error('Failed to fetch Solana price')
        }
        
        const data = await response.json()
        console.log('Price data:', data)
        setPrice(data.solana.usd)
        setError(null)
      } catch (err) {
        console.error('Price fetch error:', err)
        setError(err as Error)
        setPrice(60.42)  // Fallback price - should still allow calculator to work
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  return { price, loading, error }
} 