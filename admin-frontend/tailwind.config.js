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
          50: '#FDFBF7',
          100: '#FAF5ED',
          200: '#F4ECE0',
          300: '#E8DBC9',
          400: '#DAC8B0',
          500: '#C7B093',
        },
        clay: {
          50: '#FDF7F5',
          100: '#FAECE7',
          200: '#F4D4C9',
          300: '#EAB7A5',
          400: '#DD8E74',
          500: '#C86242',
          600: '#B64A2B',
          700: '#983B20',
          800: '#7E331E',
          900: '#682E1E',
        },
        sage: {
          50: '#F5F7F5',
          100: '#E7ECE7',
          200: '#D0DDD0',
          300: '#ADC4AD',
          400: '#84A584',
          500: '#618561',
          600: '#4C6B4C',
          700: '#3D543D',
        },
        yarn: {
          oatmeal: '#F9F6F0',
          terracotta: '#D97443',
          sage: '#8FA89B',
          dustyPink: '#E8B4B8',
          honey: '#E6AF2E',
          mocha: '#4A3B32',
          charcoal: '#2B2625',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
