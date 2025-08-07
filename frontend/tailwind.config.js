/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#4488ff',
          600: '#5599ff',
          700: '#3377ee',
        },
        danger: {
          50: '#fef2f2',
          500: '#ff4444',
          600: '#ff5555',
          700: '#ee3333',
        },
        warning: {
          50: '#fffbeb',
          500: '#ff8800',
          600: '#ff9900',
          700: '#ee7700',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#33d56e',
          700: '#11b44e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'attention': 'attention 2s ease-in-out infinite',
      },
      keyframes: {
        attention: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
