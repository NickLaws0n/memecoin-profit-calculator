export function formatNumber(value: number, options: {
  currency?: 'USD' | 'SOL'
  minDecimals?: number
  maxDecimals?: number
  prefix?: string
  suffix?: string
} = {}) {
  const {
    currency = 'USD',
    minDecimals = currency === 'USD' ? 2 : 4,
    maxDecimals = currency === 'USD' ? 2 : 4,
    prefix = currency === 'USD' ? '$' : '',
    suffix = ''
  } = options

  // Handle very small numbers
  if (Math.abs(value) < 0.0001) {
    return `${prefix}0.${'0'.repeat(maxDecimals)}${suffix}`
  }

  const sign = value < 0 ? '-' : ''
  const absValue = Math.abs(value)
  
  // Format the number with proper decimal places
  const formatted = absValue.toFixed(maxDecimals)
  
  return `${sign}${prefix}${formatted}${suffix}`
} 