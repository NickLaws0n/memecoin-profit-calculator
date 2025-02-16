"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "./ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useSolanaPrice } from "@/lib/use-solana-price"
import { SlippageInput } from "./SlippageInput"

type Currency = "USD" | "SOL"

// Add type for event
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

export default function MemecoinCalculator() {
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("USD")
  const [investmentSol, setInvestmentSol] = useState(1)
  const [targetProfit, setTargetProfit] = useState(25)
  const [fees, setFees] = useState({
    priority: 0.001,
    bribery: 0.001,
  })
  const [slippage, setSlippage] = useState(0)
  const [displayInvestmentValue, setDisplayInvestmentValue] = useState(investmentSol.toString())
  const { price: solPrice, loading, error } = useSolanaPrice()

  useEffect(() => {
    if (solPrice) {
      const formattedValue =
        displayCurrency === "USD" ? (investmentSol * solPrice).toFixed(2) : investmentSol.toFixed(4)
      setDisplayInvestmentValue(formattedValue)
    }
  }, [displayCurrency, investmentSol, solPrice])

  const handleInvestmentChange = (e: InputChangeEvent) => {
    const value = e.target.value
    setDisplayInvestmentValue(value)

    const numericValue = Number.parseFloat(value)
    if (!isNaN(numericValue)) {
      if (displayCurrency === "USD" && solPrice) {
        setInvestmentSol(numericValue / solPrice)
      } else {
        setInvestmentSol(numericValue)
      }
    } else if (value === "") {
      setInvestmentSol(0)
    }
  }

  const calculateProfit = () => {
    if (!solPrice) return null

    const priorityFeeInSol = fees.priority
    const briberyFeeInSol = fees.bribery
    const platformFeePercentage = 1
    const platformFeeInSol = (investmentSol * platformFeePercentage) / 100
    const totalFeesInSol = platformFeeInSol + priorityFeeInSol + briberyFeeInSol
    const targetAmountInSol = investmentSol * (1 + targetProfit / 100)
    const requiredSellPriceInSol = targetAmountInSol + totalFeesInSol
    const requiredIncrease = ((requiredSellPriceInSol - investmentSol) / investmentSol) * 100
    const actualSellPriceInSol = requiredSellPriceInSol * (1 + slippage / 100)
    const actualProfitInSol = actualSellPriceInSol - investmentSol - totalFeesInSol

    return {
      requiredIncrease: requiredIncrease.toFixed(2),
      expectedSellPrice: requiredSellPriceInSol,
      actualSellPrice: actualSellPriceInSol,
      actualProfit: actualProfitInSol,
      totalFees: totalFeesInSol,
      feeBreakdown: {
        platform: platformFeeInSol,
        priority: priorityFeeInSol,
        bribery: briberyFeeInSol,
      },
      slippageImpact: actualSellPriceInSol - requiredSellPriceInSol,
    }
  }

  const results = calculateProfit()

  if (loading) {
    return <div>Loading Solana price data...</div>
  }

  if (error || !results) {
    return <div>Error loading calculator. Please try again later.</div>
  }

  const formatValue = (value: number) => {
    if (displayCurrency === "USD" && solPrice !== null) {
      return `$${(value * solPrice).toFixed(2)}`
    } else {
      return `◎${value.toFixed(4)}`
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="bg-gray-900 text-white">
        <CardHeader>
          <CardTitle>Set Your Target Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                variant={targetProfit === percent ? "default" : "secondary"}
                onClick={() => setTargetProfit(percent)}
                className="w-full"
              >
                {percent}%
              </Button>
            ))}
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-4xl font-bold text-green-400">+{results.requiredIncrease}%</div>
            <div className="text-gray-400">Required price increase to achieve {targetProfit}% profit</div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Details Card */}
      <Card className="bg-white text-gray-900">
        <CardContent className="grid grid-cols-2 gap-6 pt-6">
          <div>
            <h3 className="font-semibold mb-2">Trade Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Invested</div>
              <div className="text-right font-semibold">{formatValue(investmentSol)}</div>
              <div>Expected Sell Price</div>
              <div className="text-right font-semibold text-blue-600">{formatValue(results.expectedSellPrice)}</div>
              <div>Actual Sell Price</div>
              <div className="text-right font-semibold text-green-600">{formatValue(results.actualSellPrice)}</div>
              <div>Total Fees</div>
              <div className="text-right font-semibold text-red-600">{formatValue(results.totalFees)}</div>
              <div>Slippage Impact</div>
              <div className="text-right font-semibold text-orange-600">{formatValue(results.slippageImpact)}</div>
              <div>Actual Profit</div>
              <div className="text-right font-semibold text-green-600">{formatValue(results.actualProfit)}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Fee Breakdown</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Platform Fee (1%)</div>
              <div className="text-right text-red-600">{formatValue(results.feeBreakdown.platform)}</div>
              <div>Priority Fee</div>
              <div className="text-right text-red-600">{formatValue(results.feeBreakdown.priority)}</div>
              <div>Bribery Fee</div>
              <div className="text-right text-red-600">{formatValue(results.feeBreakdown.bribery)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculator Settings Card */}
      <Card className="bg-white text-gray-900">
        <CardHeader>
          <CardTitle>Calculator Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Investment Input */}
          <div className="flex items-center justify-between">
            <label htmlFor="investment">Initial Investment</label>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDisplayCurrency((prev) => (prev === "USD" ? "SOL" : "USD"))}
              className="w-8 h-8"
            >
              {displayCurrency === "USD" ? "$" : "◎"}
            </Button>
          </div>
          <Input
            id="investment"
            type="text"
            inputMode="decimal"
            value={displayInvestmentValue}
            onChange={(e: InputChangeEvent) => handleInvestmentChange(e)}
            className="bg-gray-100"
          />

          {/* Target Profit Input */}
          <div>
            <label htmlFor="targetProfit">Target Profit (%)</label>
            <Input
              id="targetProfit"
              type="number"
              value={targetProfit}
              onChange={(e: InputChangeEvent) => setTargetProfit(Number(e.target.value))}
              className="bg-gray-100"
            />
          </div>

          {/* Priority Fee Slider */}
          <div>
            <label>Priority Fee (SOL) - Optional, starts at 0.000</label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[fees.priority]}
                onValueChange={(value: number[]) => setFees({ ...fees, priority: value[0] })}
                min={0}
                max={0.1}
                step={0.001}
                className="flex-grow"
              />
              <span className="w-20 text-right">{fees.priority.toFixed(3)} SOL</span>
            </div>
          </div>

          {/* Bribery Fee Slider */}
          <div>
            <label>Bribery Fee (SOL) - Optional incentive</label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[fees.bribery]}
                onValueChange={(value: number[]) => setFees({ ...fees, bribery: value[0] })}
                min={0}
                max={0.1}
                step={0.001}
                className="flex-grow"
              />
              <span className="w-20 text-right">{fees.bribery.toFixed(3)} SOL</span>
            </div>
          </div>

          {/* Slippage Input */}
          <SlippageInput slippage={slippage} setSlippage={setSlippage} />
        </CardContent>
      </Card>
    </div>
  )
} 