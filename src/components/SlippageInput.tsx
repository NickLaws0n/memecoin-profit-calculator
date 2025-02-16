import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface SlippageInputProps {
  slippage: number
  setSlippage: (value: number) => void
}

export function SlippageInput({ slippage, setSlippage }: SlippageInputProps) {
  const presetValues = [-50, -10, 0, 10, 50]

  const getSlippageImpact = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue <= 10) return { color: "text-green-500", text: "Low" }
    if (absValue <= 50) return { color: "text-yellow-500", text: "Medium" }
    return { color: "text-red-500", text: "High" }
  }

  const impact = getSlippageImpact(slippage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-text-secondary">Slippage (%)</label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="w-4 h-4 text-text-secondary" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Expected price impact from market volatility</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className={`text-sm font-medium ${
          Math.abs(slippage) <= 10 ? "text-success" : 
          Math.abs(slippage) <= 50 ? "text-warning" : "text-error"
        }`}>
          {Math.abs(slippage) <= 10 ? "LOW" : 
           Math.abs(slippage) <= 50 ? "MEDIUM" : "HIGH"} IMPACT
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Slider
          value={[slippage]}
          onValueChange={(value) => setSlippage(value[0])}
          min={-100}
          max={100}
          step={1}
          className="flex-grow"
        />
        <span className={`w-16 text-right ${slippage >= 0 ? "text-green-500" : "text-red-500"}`}>
          {slippage >= 0 ? "+" : ""}
          {slippage.toFixed(1)}%
        </span>
      </div>
      <div className="flex space-x-2">
        {[-50, -10, 0, 10, 50].map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => setSlippage(value)}
            className={`${
              slippage === value ? "bg-card-lighter" : ""
            } ${value < 0 ? "text-error" : value > 0 ? "text-success" : ""}`}
          >
            {value >= 0 ? "+" : ""}{value}%
          </Button>
        ))}
      </div>
    </div>
  )
} 