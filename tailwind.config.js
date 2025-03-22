/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent-blue': '#4285F4',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'success-light': '#D1FAE5',
        'warning-light': '#FEF3C7',
        'error-light': '#FEE2E2',
        background: '#FFFFFF',
        card: {
          DEFAULT: '#FAFAFA',
          lighter: '#FFFFFF'
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
        'card': '0 1px 3px rgba(0,0,0,0.1)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config

