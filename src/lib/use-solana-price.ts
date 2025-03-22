"use client"

import { useState, useEffect } from "react"

const FALLBACK_PRICE = 165 // Reasonable fallback price if API fails

export function useSolanaPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data?.solana?.usd) {
          throw new Error('Invalid price data received')
        }

        setPrice(data.solana.usd)
        setError(null)
        setRetryCount(0)
      } catch (err) {
        console.error('Price fetch error:', err)
        setError(err as Error)
        
        // Use fallback price after 3 retries
        if (retryCount >= 2) {
          console.log('Using fallback price after multiple retries')
          setPrice(FALLBACK_PRICE)
          setError(null)
        } else {
          setRetryCount(prev => prev + 1)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    
    // Retry every 5 seconds if there's an error and we haven't hit max retries
    const interval = error && retryCount < 3 
      ? setInterval(fetchPrice, 5000)
      : setInterval(fetchPrice, 60000) // Normal refresh every minute

    return () => clearInterval(interval)
  }, [error, retryCount])

  return { 
    price, 
    loading, 
    error,
    retry: () => setRetryCount(0) // Expose retry function
  }
} 