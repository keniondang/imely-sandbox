/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        imely: {
          primary: '#12B886',
          primaryDark: '#0DA271',
          mint: '#E3FBF3',
          mintDeep: '#CFF6E8',
          ink: '#16181C',
          sub: '#8B92A0',
          line: '#EEF0F3',
          bg: '#FFFFFF',
          pink: '#FF5C87',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)',
      },
    },
  },
  plugins: [],
}
