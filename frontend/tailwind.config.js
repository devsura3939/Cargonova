/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36aff8',
          500: '#0c93e7',
          600: '#0275c8',
          700: '#035da3',
          800: '#074f85',
          900: '#0c426e',
          950: '#082a4a',
        },
        slate: {
          850: '#111827',
          900: '#0f172a',
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
}
