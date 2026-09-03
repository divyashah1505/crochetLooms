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
        cream: {
          50: '#FAF8F5',
          100: '#F5F0E8',
          200: '#EBE2D5',
          300: '#DED1BF',
          400: '#CFBDA5',
          500: '#BFA88B',
        },
        clay: {
          50: '#FDF8F6',
          100: '#F8ECE7',
          200: '#F1D5CC',
          300: '#E4B4A5',
          400: '#D58E7B',
          500: '#C26A54',
          600: '#A9513C',
          700: '#8A3D2C',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E4ECE6',
          200: '#CBDBCF',
          300: '#A7C2AD',
          400: '#7FA388',
          500: '#60866A',
          600: '#4A6C53',
        },
        yarn: {
          dustyPink: '#E8B4B8',
          honey: '#E6AF2E',
          lavender: '#C5ADC5',
          terracotta: '#C86D51',
          mocha: '#4A3B32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        'cozy': '0 4px 20px -2px rgba(138, 61, 44, 0.08)',
        'cozy-lg': '0 10px 30px -5px rgba(138, 61, 44, 0.12)',
        'craft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 10px 25px rgba(194, 106, 84, 0.06)',
      },
    },
  },
  plugins: [],
};
