/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xxs': '360px',
        'xs': '480px',
      },
      colors: {
        ayur: {
          50: '#f2f8f4',
          100: '#e1efe5',
          200: '#c4e0ce',
          300: '#99caa9',
          400: '#68ac80',
          500: '#438e5d',
          600: '#327249',
          700: '#285a3b',
          800: '#1b4332',
          900: '#153628',
          950: '#081c15',
        },
        ivory: {
          50: '#fefefe',
          100: '#faf8f5',
          200: '#f5f0ea',
          300: '#ede4d8',
          400: '#dfd1bf',
          500: '#cdb9a0',
        },
        gold: {
          50: '#fdfbf0',
          100: '#faf5d8',
          200: '#f4e7a8',
          300: '#ebd371',
          400: '#e2bc3d',
          500: '#d4af37',
          600: '#b8860b',
          700: '#956509',
        },
        terracotta: {
          50: '#fdf5f2',
          100: '#fce7e0',
          500: '#c66b47',
          600: '#b05330',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        premium: '0 10px 30px -5px rgba(27, 67, 50, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        elevated: '0 20px 40px -10px rgba(27, 67, 50, 0.12)',
      },
    },
  },
  plugins: [],
};
