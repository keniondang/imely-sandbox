/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        // Theme-aware tokens — resolve to CSS variables flipped under `.dark`
        // (see index.css), so the ~900 existing bg-white/text-imely-ink/
        // text-gray-*/border-imely-line usages across every screen adapt to
        // dark mode by swapping variable values, not by hand-adding a
        // `dark:` variant to each one individually. Deliberately separate
        // from the imely.* palette above: imely.ink/bg stay literal (used
        // for permanently-dark chrome like the Inspector sidebar and brand
        // badges that should NOT flip with the theme).
        surface: 'var(--color-surface)',
        subtle: 'var(--color-subtle)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        faint: 'var(--color-faint)',
        line: 'var(--color-line)',
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
