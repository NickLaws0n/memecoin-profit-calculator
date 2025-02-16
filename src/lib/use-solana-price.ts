"use client"

import { useState, useEffect } from "react"

export function useSolanaPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")
        const data = await response.json()
        setPrice(data.solana.usd)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch Solana price")
        setLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return { price, loading, error }
} 