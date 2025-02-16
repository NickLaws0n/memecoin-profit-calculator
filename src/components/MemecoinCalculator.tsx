"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "./ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useSolanaPrice } from "@/lib/use-solana-price"
import { SlippageInput } from "./SlippageInput"
import { WalletIcon, TrendingUpIcon, ClockIcon, CoinsIcon, Settings2Icon } from "lucide-react"

type Currency = "USD" | "SOL"

// Add type for event
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="bg-card p-4 rounded-lg flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-text-secondary text-sm">{title}</span>
      {icon}
    </div>
    <span className="text-2xl font-bold text-text-primary">{value}</span>
  </div>
)

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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Investment Amount"
          value={formatValue(investmentSol)}
          icon={<WalletIcon className="w-6 h-6 text-success" />}
        />
        <StatCard
          title="Target Profit"
          value={`+${targetProfit}%`}
          icon={<TrendingUpIcon className="w-6 h-6 text-blue-500" />}
        />
        <StatCard
          title="Required Increase"
          value={`+${results.requiredIncrease}%`}
          icon={<ClockIcon className="w-6 h-6 text-success" />}
        />
        <StatCard
          title="Total Fees"
          value={formatValue(results.totalFees)}
          icon={<CoinsIcon className="w-6 h-6 text-error" />}
        />
      </div>

      {/* Trade Details Card */}
      <Card className="bg-card text-text-primary">
        <CardHeader>
          <CardTitle>Trade Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-text-secondary mb-4">Overview</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-text-secondary">Expected Sell Price</div>
              <div className="text-right font-semibold">{formatValue(results.expectedSellPrice)}</div>
              <div className="text-text-secondary">Actual Sell Price</div>
              <div className="text-right font-semibold text-success">{formatValue(results.actualSellPrice)}</div>
              <div className="text-text-secondary">Slippage Impact</div>
              <div className="text-right font-semibold text-warning">{formatValue(results.slippageImpact)}</div>
              <div className="text-text-secondary">Actual Profit</div>
              <div className="text-right font-semibold text-success">{formatValue(results.actualProfit)}</div>
            </div>
          </div>
          <div>
            <h3 className="text-text-secondary mb-4">Fee Breakdown</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-text-secondary">Platform Fee (1%)</div>
              <div className="text-right text-error">{formatValue(results.feeBreakdown.platform)}</div>
              <div className="text-text-secondary">Priority Fee</div>
              <div className="text-right text-error">{formatValue(results.feeBreakdown.priority)}</div>
              <div className="text-text-secondary">Bribery Fee</div>
              <div className="text-right text-error">{formatValue(results.feeBreakdown.bribery)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculator Settings Card */}
      <Card className="bg-card text-text-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2Icon className="w-5 h-5 text-text-secondary" />
            <CardTitle>Calculator Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Profit Buttons */}
          <div>
            <label className="text-text-secondary mb-2 block">Target Profit (%)</label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant={targetProfit === value ? "default" : "outline"}
                  onClick={() => setTargetProfit(value)}
                  className={targetProfit === value ? "bg-success text-white" : ""}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          {/* Investment Input */}
          <div>
            <label className="text-text-secondary mb-2 block">Initial Investment</label>
            <div className="relative">
              <Input
                value={displayInvestmentValue}
                onChange={handleInvestmentChange}
                className="input-dark pr-16"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDisplayCurrency(prev => prev === "USD" ? "SOL" : "USD")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {displayCurrency}
              </Button>
            </div>
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