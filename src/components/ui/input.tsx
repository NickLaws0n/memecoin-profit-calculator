"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Add this style to remove number input spinners
const baseStyles = {
  '[type="number"]::-webkit-inner-spin-button, [type="number"]::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: '0'
  },
  '[type="number"]': {
    '-moz-appearance': 'textfield'
  }
}

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-text-secondary",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          baseStyles,  // Add the base styles
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 