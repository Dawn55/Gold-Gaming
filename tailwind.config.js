/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon': {
          100: '#d0ffdc',
          200: '#a1ffba',
          300: '#72ff97',
          400: '#43ff75',
          500: '#00ff41',  // Primary neon green
          600: '#00cc34',  // Darker variant
          700: '#009927',
          800: '#00661a',
          900: '#00330d',
        },
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 65, 0.7)',
        'neon-lg': '0 0 20px rgba(0, 255, 65, 0.7)',
      }
    },
  },
  plugins: [],
}