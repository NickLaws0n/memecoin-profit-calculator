import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SlippageInputProps {
  slippage: number
  setSlippage: (value: number) => void
}

export function SlippageInput({ slippage, setSlippage }: SlippageInputProps) {
  const getImpactColor = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue <= 10) return "text-text-secondary"
    if (absValue <= 50) return "text-warning"
    return value >= 0 ? "text-success" : "text-error"
  }

  const getImpactText = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue <= 10) return "LOW"
    if (absValue <= 50) return "MEDIUM"
    return "HIGH"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-text-secondary">
            Slippage (%)
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="w-4 h-4 text-text-secondary" />
              </TooltipTrigger>
              <TooltipContent className="bg-white p-2 shadow-lg rounded-lg border border-gray-100">
                <p className="text-sm text-text-secondary">
                  Expected price impact from market volatility
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className={cn(
          "text-sm font-medium",
          getImpactColor(slippage)
        )}>
          {getImpactText(slippage)} IMPACT
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Slider
            value={[slippage]}
            onValueChange={(value) => setSlippage(value[0])}
            min={-100}
            max={100}
            step={1}
            className="py-2"
          />
          <span className={cn(
            "w-20 text-right text-sm font-medium",
            getImpactColor(slippage)
          )}>
            {slippage >= 0 ? "+" : ""}{slippage.toFixed(1)}%
          </span>
        </div>

        <div className="flex gap-2">
          {[-50, -10, 0, 10, 50].map((value) => (
            <Button
              key={value}
              variant="outline"
              size="sm"
              onClick={() => setSlippage(value)}
              className={cn(
                "flex-1 h-10 transition-all",
                slippage === value && "bg-card shadow-sm",
                getImpactColor(value),
                "hover:bg-gray-50"
              )}
            >
              {value >= 0 ? "+" : ""}{value}%
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
} 