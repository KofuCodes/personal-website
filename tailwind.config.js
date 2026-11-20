// Theme tokens live as RGB channels in index.css (light on :root, dark on
// .dark), so every paper/ink/beak utility, opacity modifiers included, flips
// with the theme without needing a dark: variant at each use.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
      // The values for both themes are in index.css.
      colors: {
        paper: { DEFAULT: token('paper'), 100: token('paper-100'), 200: token('paper-200') },
        ink: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((k) => [k, token(`ink-${k}`)])
        ),
        beak: token('beak'),
      },
    },
  },
};
