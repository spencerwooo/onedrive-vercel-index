const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans SC"', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
