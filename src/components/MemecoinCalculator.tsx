"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "./ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useSolanaPrice } from "@/lib/use-solana-price"
import { SlippageInput } from "./SlippageInput"
import { WalletIcon, TrendingUpIcon, ClockIcon, CoinsIcon, Settings2Icon, DollarSign, CircleDotIcon as SolanaIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SolanaIcon as SolanaIconComponent } from "./icons/SolanaIcon"

type Currency = "USD" | "SOL"

// Add type for event
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

const StatCard = ({ title, value, icon, trend }: { title: string, value: string | React.ReactNode, icon: React.ReactNode, trend?: string }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-sm text-text-secondary font-normal mb-1">{title}</h3>
        <div className="text-xl text-text-primary font-medium">{value}</div>
      </div>
      <div className="p-1.5 rounded-full bg-gray-50">{icon}</div>
    </div>
    {trend && (
      <div className="text-sm text-text-secondary mt-2 font-normal">{trend}</div>
    )}
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
  const [displayInvestmentValue, setDisplayInvestmentValue] = useState("0.00")
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

  if (!results) {
    return <div>Error loading calculator. Please try again later.</div>
  }

  const formatValue = (value: number) => {
    if (displayCurrency === "USD" && solPrice !== null) {
      return `$${(value * solPrice).toFixed(2)}`
    } else {
      return <span className="flex items-center gap-1">
        <SolanaIconComponent className="w-3.5 h-3.5 text-[#4285F4] inline" />
        {value.toFixed(4)}
      </span>
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Initial Investment"
          value={formatValue(investmentSol)}
          icon={<WalletIcon className="w-4 h-4 text-text-secondary" />}
        />
        <StatCard
          title="Target Profit"
          value={`+${targetProfit}%`}
          icon={<TrendingUpIcon className="w-4 h-4 text-text-secondary" />}
        />
        <StatCard
          title="Required Increase"
          value={`+${results.requiredIncrease}%`}
          icon={<ClockIcon className="w-4 h-4 text-text-secondary" />}
        />
        <StatCard
          title="Total Fees"
          value={formatValue(results.totalFees)}
          icon={<CoinsIcon className="w-4 h-4 text-text-secondary" />}
        />
      </div>

      {/* Trade Details Card */}
      <Card>
        <CardHeader className="border-b border-gray-100 pb-6">
          <CardTitle className="text-text-primary">Trade Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-16 pt-8">
          <div>
            <h3 className="text-text-secondary text-sm mb-6 font-medium">Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Expected Sell Price</span>
                <div className="w-[120px]">
                  {formatValue(results.expectedSellPrice)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Actual Sell Price</span>
                <div className="w-[120px] text-success">
                  {formatValue(results.actualSellPrice)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Slippage Impact</span>
                <div className="w-[120px] text-warning">
                  {formatValue(results.slippageImpact)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Actual Profit</span>
                <div className="w-[120px] text-success">
                  {formatValue(results.actualProfit)}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-text-secondary text-sm mb-6 font-medium">Fee Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Platform Fee (1%)</span>
                <div className="w-[120px] text-error">
                  {formatValue(results.feeBreakdown.platform)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Priority Fee</span>
                <div className="w-[120px] text-error">
                  {formatValue(results.feeBreakdown.priority)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Bribery Fee</span>
                <div className="w-[120px] text-error">
                  {formatValue(results.feeBreakdown.bribery)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculator Settings Card */}
      <Card>
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center gap-2">
            <Settings2Icon className="w-4 h-4 text-[#5F6368]" />
            <CardTitle>Calculator Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Target Profit Buttons */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-text-secondary">
              Target Profit (%)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant={targetProfit === value ? "default" : "outline"}
                  onClick={() => setTargetProfit(value)}
                  className={cn(
                    "h-10 rounded-lg",
                    targetProfit === value 
                      ? "bg-[#4285F4] text-white border-none"
                      : "text-text-primary hover:bg-gray-50 border border-gray-200"
                  )}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          {/* Investment Input */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-text-secondary">
              Initial Investment
            </label>
            <div className="relative flex items-center">
              <Input
                value={displayInvestmentValue}
                onChange={handleInvestmentChange}
                className="pr-24 h-12 text-base text-text-primary placeholder-text-secondary text-right"
                placeholder="0.00"
              />
              <div className="absolute right-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisplayCurrency(prev => prev === "USD" ? "SOL" : "USD")}
                  className="h-8 px-3 min-w-[4rem] font-medium border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  {displayCurrency === "USD" ? (
                    <>
                      <DollarSign className="w-4 h-4 text-text-secondary" />
                      <span className="text-text-primary">USD</span>
                    </>
                  ) : (
                    <>
                      <SolanaIconComponent className="w-5 h-5 text-[#4285F4]" />
                      <span className="text-text-primary">SOL</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Priority Fee */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm text-text-secondary font-normal">
                Priority Fee (SOL)
              </label>
              <span className="text-sm text-text-secondary">
                {fees.priority.toFixed(3)} SOL
              </span>
            </div>
            <Slider
              value={[fees.priority]}
              onValueChange={(value: number[]) => setFees({ ...fees, priority: value[0] })}
              min={0}
              max={0.1}
              step={0.001}
              className="py-2"
            />
          </div>

          {/* Bribery Fee */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm text-text-secondary font-normal">
                Bribery Fee (SOL)
              </label>
              <span className="text-sm text-text-secondary">
                {fees.bribery.toFixed(3)} SOL
              </span>
            </div>
            <Slider
              value={[fees.bribery]}
              onValueChange={(value: number[]) => setFees({ ...fees, bribery: value[0] })}
              min={0}
              max={0.1}
              step={0.001}
              className="py-2"
            />
          </div>

          {/* Slippage Input */}
          <SlippageInput slippage={slippage} setSlippage={setSlippage} />
        </CardContent>
      </Card>
    </div>
  )
} 