/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nova: {
          blue:     '#6B9BBF',
          'blue-light': '#A8C4D8',
          'blue-dark':  '#4A7A9B',
          'blue-50':    '#EEF4F9',
          'blue-100':   '#D7E8F2',
          tan:      '#C4956A',
          'tan-light':  '#D9B897',
          'tan-dark':   '#A0744A',
          'tan-50':     '#F7F0E8',
          'tan-100':    '#EDDCC8',
          cream:    '#FAF7F4',
          'cream-dark': '#F0EAE2',
          stone:    '#7C6B5A',
          'stone-light':'#A89585',
        },
      },
    },
  },
  plugins: [],
};
