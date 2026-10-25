/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.tsx', './components/**/*.tsx', './pages/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        // One typeface everywhere: an editorial serif whose optical-size axis
        // cuts sturdier letters for small text and finer ones for the name.
        sans: ['Newsreader', 'Georgia', '"Times New Roman"', 'serif'],
      },
      // Watercolour palette, sampled from the geese painting. ink is a cool
      // payne's-grey neutral standing in for stone; 500/600 hold >= 4.5:1
      // on paper. beak is the accent, a burnt orange from the goose beaks.
      colors: {
        paper: { DEFAULT: '#fbfaf6', 100: '#f3f1ea', 200: '#e9e5da' },
        ink: {
          50: '#f6f7f7',
          100: '#eceeef',
          200: '#dde1e3',
          300: '#c5cbce',
          400: '#969ea3',
          500: '#62696e',
          600: '#484f54',
          700: '#3c4246',
          800: '#272c30',
          900: '#1b1f22',
          950: '#111416',
        },
        beak: '#a3541a',
      },
    },
  },
};
