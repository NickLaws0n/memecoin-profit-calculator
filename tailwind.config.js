/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1120',
        card: {
          DEFAULT: '#111827',  // Dark card background
          lighter: '#1F2937'   // Slightly lighter for inputs
        },
        success: '#22C55E',    // Green for positive values
        error: '#EF4444',      // Red for negative/fees
        warning: '#F59E0B',    // Yellow for warnings/slippage
        text: {
          primary: '#FFFFFF',
          secondary: '#9CA3AF'
        }
      },
      borderRadius: 'lg',
    },
  },
  plugins: [require("tailwindcss-animate")],
}

