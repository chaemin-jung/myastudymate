/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        mya: {
          50: '#fff9f0',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbe70',
          400: '#ff9a36',
          500: '#ff7d0f',
          600: '#f06200',
          700: '#c74d02',
          800: '#9e3d0b',
          900: '#7f340e',
        }
      }
    },
  },
  plugins: [],
}
