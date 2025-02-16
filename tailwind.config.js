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
        background: '#FFFFFF',
        card: {
          DEFAULT: '#FAFAFA',
          lighter: '#FFFFFF'
        },
        success: {
          light: '#E6F4EA',
          DEFAULT: '#34A853'
        },
        error: {
          light: '#FCE8E8',
          DEFAULT: '#EA4335'
        },
        warning: '#F59E0B',    // Yellow for warnings/slippage
        text: {
          primary: '#202124',
          secondary: '#5F6368'
        },
        accent: {
          blue: '#4285F4',
          green: '#34A853',
          red: '#EA4335',
          yellow: '#FBBC05'
        }
      },
      borderRadius: 'lg',
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

