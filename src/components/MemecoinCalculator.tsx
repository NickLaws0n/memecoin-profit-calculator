"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "./ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useSolanaPrice } from "@/lib/use-solana-price"
import { SlippageInput } from "./SlippageInput"
import { WalletIcon, TrendingUpIcon, ClockIcon, CoinsIcon, Settings2Icon, DollarSign, CircleDotIcon as SolanaIcon, InfoIcon, RotateCcwIcon, ArrowUpCircle, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { SolanaIcon as SolanaIconComponent } from "./icons/SolanaIcon"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from '@/lib/formatNumber'

type Currency = "USD" | "SOL"

// Add type for event
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

// Add a type for the calculation results
type CalculationResults = {
  requiredIncrease: string
  expectedSellPrice: number
  actualSellPrice: number
  netProfit: number
  totalFees: number
  feeBreakdown: {
    platform: number
    priority: number
    bribery: number
  }
  slippageImpact: number
}

// Also update INITIAL_VALUES to be more explicit
const INITIAL_VALUES = {
  investment: 1.00,  // Start with 1 USD/SOL
  netProfitTarget: 25,
  fees: {
    priority: 0.001,
    bribery: 0.001,
  },
  slippage: 0
}

const StatCard = ({ title, value, icon, trend, ariaLabel, className }: { 
  title: string, 
  value: string | React.ReactNode, 
  icon: React.ReactNode, 
  trend?: string, 
  ariaLabel?: string,
  className?: string
}) => (
  <div 
    className={`bg-white rounded-lg border border-gray-100 p-4 ${className || ''}`}
    aria-label={ariaLabel}
    role="region"
  >
    <div className="flex justify-between items-start">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm text-text-secondary font-normal truncate">{title}</h3>
        </div>
        <div className={cn(
          "text-xl font-medium break-words",
          className ? className : "text-text-primary"
        )}>{value}</div>
      </div>
      <div className="p-1.5 rounded-full bg-gray-50 flex-shrink-0">{icon}</div>
    </div>
    {trend && (
      <div className="text-sm text-text-secondary mt-2 font-normal truncate">{trend}</div>
    )}
  </div>
)

export default function MemecoinCalculator() {
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("USD")
  const [investmentSol, setInvestmentSol] = useState(INITIAL_VALUES.investment)
  const [netProfitTarget, setNetProfitTarget] = useState(INITIAL_VALUES.netProfitTarget)
  const [fees, setFees] = useState(INITIAL_VALUES.fees)
  const [slippage, setSlippage] = useState(INITIAL_VALUES.slippage)
  const [displayInvestmentValue, setDisplayInvestmentValue] = useState(INITIAL_VALUES.investment.toString())
  const { price: solPrice, loading, error } = useSolanaPrice()

  // Change the initial state to true
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(true)

  const handleInvestmentChange = (e: InputChangeEvent) => {
    const value = e.target.value
    
    // Always allow empty input or single decimal
    if (value === "" || value === ".") {
      setDisplayInvestmentValue(value)
      setInvestmentSol(0)
      return
    }
    
    // Allow typing numbers and decimals freely
    if (!/^[\d.]*$/.test(value)) {
      return
    }
    
    // Keep the display value updated
    setDisplayInvestmentValue(value)
    
    // Only update the SOL value if we have a valid number
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      if (displayCurrency === "USD" && solPrice) {
        setInvestmentSol(numValue / solPrice)
      } else {
        setInvestmentSol(numValue)
      }
    } else {
      setInvestmentSol(0)
    }
  }

  const calculateProfit = () => {
    if (!solPrice || investmentSol <= 0) return null

    // Calculate fees with minimum thresholds
    const priorityFeeInSol = Math.max(fees.priority, 0.0001)
    const briberyFeeInSol = Math.max(fees.bribery, 0.0001)
    const platformFeePercentage = 1
    const platformFeeInSol = Math.max((investmentSol * platformFeePercentage) / 100, 0.0001)
    const totalFeesInSol = platformFeeInSol + priorityFeeInSol + briberyFeeInSol

    // Calculate target amount with profit
    const targetAmountInSol = investmentSol * (1 + netProfitTarget / 100)
    const requiredSellPriceInSol = targetAmountInSol + totalFeesInSol
    
    // Calculate required increase with better precision
    const requiredIncrease = ((requiredSellPriceInSol - investmentSol) / investmentSol) * 100
    const formattedIncrease = requiredIncrease > 1000 
      ? requiredIncrease.toFixed(0) 
      : requiredIncrease.toFixed(2)
    
    // Apply slippage with better precision
    const slippageMultiplier = 1 + (slippage / 100)
    const actualSellPriceInSol = requiredSellPriceInSol * slippageMultiplier
    const netProfitInSol = actualSellPriceInSol - investmentSol - totalFeesInSol

    return {
      requiredIncrease: formattedIncrease,
      expectedSellPrice: requiredSellPriceInSol,
      actualSellPrice: actualSellPriceInSol,
      netProfit: netProfitInSol,
      totalFees: totalFeesInSol,
      feeBreakdown: {
        platform: platformFeeInSol,
        priority: priorityFeeInSol,
        bribery: briberyFeeInSol,
      },
      slippageImpact: actualSellPriceInSol - requiredSellPriceInSol,
    }
  }

  const formatValue = useCallback((value: number) => {
    if (value === 0) return displayCurrency === "USD" ? "$0.00" : "0.0000 SOL"
    
    if (displayCurrency === "USD" && solPrice) {
      return `$${(value * solPrice).toFixed(2)}`
    }
    
    return <span className="flex items-center gap-1">
      <SolanaIconComponent className="w-3.5 h-3.5 text-[#4285F4] inline" />
      {value.toFixed(4)}
    </span>
  }, [displayCurrency, solPrice])

  const results = useMemo(() => 
    calculateProfit(),
    [investmentSol, netProfitTarget, fees, slippage, solPrice]
  )

  const formattedValues = useMemo(() => {
    if (!results) return null
    
    return {
      expectedSellPrice: formatValue(results.expectedSellPrice),
      actualSellPrice: formatValue(results.actualSellPrice),
      netProfit: formatValue(results.netProfit),
      slippageImpact: formatValue(results.slippageImpact),
      platformFee: formatValue(results.feeBreakdown.platform),
      priorityFee: formatValue(results.feeBreakdown.priority),
      briberyFee: formatValue(results.feeBreakdown.bribery),
    }
  }, [results, formatValue])

  const handleReset = () => {
    setInvestmentSol(INITIAL_VALUES.investment)
    setDisplayInvestmentValue(INITIAL_VALUES.investment.toString())
    setNetProfitTarget(INITIAL_VALUES.netProfitTarget)
    setFees(INITIAL_VALUES.fees)
    setSlippage(INITIAL_VALUES.slippage)
  }

  const handleCurrencySwitch = useCallback(() => {
    if (!solPrice) return
    
    const newCurrency = displayCurrency === "USD" ? "SOL" : "USD"
    
    // Parse current display value
    const numValue = parseFloat(displayInvestmentValue)
    let newValue: string
    
    if (!isNaN(numValue)) {
      // Only convert if we have a valid number
      if (newCurrency === "USD") {
        newValue = (investmentSol * solPrice).toFixed(2)
      } else {
        newValue = investmentSol.toFixed(4)
      }
    } else {
      // Keep the current input if it's not a valid number yet
      newValue = displayInvestmentValue
    }
    
    setDisplayCurrency(newCurrency)
    setDisplayInvestmentValue(newValue)
  }, [solPrice, displayCurrency, investmentSol, displayInvestmentValue])

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48 mx-auto" />
          <p className="text-text-secondary">Loading Solana price data...</p>
        </div>
      </div>
    )
  }

  if (error || !solPrice) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="space-y-4">
          <div className="text-error">Unable to load Solana price data</div>
          <p className="text-text-secondary">
            {error?.message || "Please check your connection and try again"}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            <RotateCcwIcon className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8">
      {/* Instructions text - dark text for light background */}
      <p className="text-center text-lg font-medium text-text-primary mb-8">
        Enter your investment amount and desired profit target to calculate your memecoin trading strategy
      </p>

      {/* Calculator Settings Card First */}
      <Card>
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2Icon className="w-4 h-4 text-[#5F6368]" />
              <CardTitle>Calculator Settings</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-text-secondary hover:text-text-primary flex items-center gap-1.5"
            >
              <RotateCcwIcon className="w-4 h-4" />
              Reset to Default
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Investment and Target Profit on same line */}
          <div className="flex items-start gap-8">
            {/* Initial Investment */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <label className="text-base font-semibold text-text-primary">
                  Initial Investment
                </label>
                <div className="relative flex items-center w-48">
                  <Input
                    value={displayInvestmentValue}
                    onChange={handleInvestmentChange}
                    className="h-12 text-base text-text-primary placeholder-text-secondary text-left pr-20"
                    placeholder="0.00"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    aria-label={`Initial investment in ${displayCurrency}`}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCurrencySwitch}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCurrencySwitch()
                        }
                      }}
                      aria-label={`Switch to ${displayCurrency === "USD" ? "SOL" : "USD"}`}
                      className={cn(
                        "h-8 px-3 min-w-[4rem] font-medium border-gray-200",
                        "hover:bg-gray-50 transition-colors flex items-center gap-1.5",
                        "focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
                      )}
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
            </div>

            {/* Net Profit Target */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-base font-semibold text-text-primary">
                    Net Profit Target
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="w-4 h-4 text-text-secondary" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm text-text-secondary">
                          The percentage increase in value you want to achieve after fees.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative w-48">
                  <Input
                    value={netProfitTarget}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.split('.')[0])
                      if (!isNaN(value) && value >= 0 && value <= 1000) {
                        setNetProfitTarget(value)
                      }
                    }}
                    className="h-12 text-base text-text-primary placeholder-text-secondary text-left pr-8"
                    placeholder="Enter custom percentage"
                    type="number"
                    min="0"
                    max="1000"
                    step="1"
                    aria-label="Custom net profit percentage"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Fee */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary font-normal" htmlFor="priority-fee">
                  Priority Fee (SOL)
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-text-secondary" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm text-text-secondary">
                        Priority fees increase the likelihood of your transaction being processed quickly.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm text-text-secondary">
                {fees.priority.toFixed(3)} SOL
              </span>
            </div>
            <Slider
              id="priority-fee"
              value={[fees.priority]}
              onValueChange={(value: number[]) => setFees({ ...fees, priority: value[0] })}
              min={0}
              max={0.1}
              step={0.001}
              className="py-2"
              aria-label="Adjust priority fee"
            />
          </div>

          {/* Bribery Fee */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary font-normal" htmlFor="bribery-fee">
                  Bribery Fee (SOL)
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-text-secondary" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm text-text-secondary">
                        Additional incentive for validators in competitive market conditions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm text-text-secondary">
                {fees.bribery.toFixed(3)} SOL
              </span>
            </div>
            <Slider
              id="bribery-fee"
              value={[fees.bribery]}
              onValueChange={(value: number[]) => setFees({ ...fees, bribery: value[0] })}
              min={0}
              max={0.1}
              step={0.001}
              className="py-2"
              aria-label="Adjust bribery fee"
            />
          </div>

          {/* Fee Breakdown - Moved from Trade Details */}
          <div className="space-y-3">
            <button
              onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Fee Breakdown</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-3.5 h-3.5 text-text-secondary" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm text-text-secondary">
                        Detailed breakdown of all transaction fees
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <ChevronDown 
                className={cn(
                  "w-3.5 h-3.5 text-text-secondary transition-transform",
                  showFeeBreakdown ? "rotate-180" : ""
                )} 
              />
            </button>
            
            {showFeeBreakdown && (
              <div className="space-y-3 px-3 py-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-secondary">Platform Fee (1%)</span>
                  </div>
                  <div className="text-xs text-error">
                    {formattedValues?.platformFee || formatValue(0)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-secondary">Priority Fee</span>
                  </div>
                  <div className="text-xs text-error">
                    {formattedValues?.priorityFee || formatValue(0)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-secondary">Bribery Fee</span>
                  </div>
                  <div className="text-xs text-error">
                    {formattedValues?.briberyFee || formatValue(0)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Target PnL and Target Sell Price section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Target Sell Price First */}
            <div className="p-6 bg-accent-blue/5 rounded-lg border-2 border-accent-blue">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-lg font-medium text-accent-blue">
                    Target Sell Price
                  </label>
                </div>
                <div className="text-2xl font-bold text-accent-blue">
                  {formattedValues?.expectedSellPrice || "0.00"}
                </div>
              </div>
            </div>

            {/* Target PnL Second */}
            <div className="p-6 bg-accent-blue/5 rounded-lg border-2 border-accent-blue">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-lg font-medium text-accent-blue">
                    Target PnL
                  </label>
                </div>
                <div className="text-2xl font-bold text-accent-blue">
                  +{results?.requiredIncrease || "0.00"}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Details Card Last */}
      {(investmentSol > 0 || displayInvestmentValue !== "") && formattedValues && (
        <Card>
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="text-text-primary">Trade Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            {/* Slippage control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary">Slippage (%)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="w-4 h-4 text-text-secondary" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm text-text-secondary">
                          Expected price impact from market volatility
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-lg font-medium text-text-primary">
                  {slippage >= 0 ? "+" : ""}{Math.round(slippage)}%
                </div>
              </div>
              
              {/* Slider with clickable labels */}
              <div className="space-y-3">
                <Slider
                  value={[slippage]}
                  onValueChange={(value) => setSlippage(value[0])}
                  min={-100}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <div className="flex justify-between px-1">
                  {[-100, -75, -50, -25, 0, 25, 50, 75, 100].map((value) => (
                    <Button
                      key={value}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSlippage(value)}
                      className={cn(
                        "h-6 px-1 min-w-[2.75rem]",
                        "text-xs hover:bg-gray-50 rounded transition-colors",
                        "border border-transparent hover:border-gray-200",
                        slippage === value 
                          ? "text-[#4285F4] font-medium bg-blue-50/50"
                          : "text-text-secondary"
                      )}
                    >
                      {value >= 0 ? "+" : ""}{value}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actual Sell Price and Net Profit in grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {/* Actual Sell Price */}
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-lg font-medium text-text-primary">
                      Actual Sell Price
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-5 h-5 text-text-secondary" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm text-text-secondary">
                            Includes slippage impact of {formattedValues.slippageImpact}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    !results ? "text-text-primary" :
                    results.netProfit > 0 
                      ? "text-[#10B981]"
                      : results.netProfit < 0 
                        ? "text-[#EF4444]"
                        : "text-text-primary"
                  )}>
                    {formattedValues.actualSellPrice}
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-lg font-medium text-text-primary">
                      Net Profit
                    </label>
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    !results ? "text-text-primary" :
                    results.netProfit > 0 
                      ? "text-[#10B981]"
                      : results.netProfit < 0 
                        ? "text-[#EF4444]"
                        : "text-text-primary"
                  )}>
                    {formatValue(results?.netProfit || 0)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 