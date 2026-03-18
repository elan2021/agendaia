/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: '#E8622A',
          'coral-light': '#FDF0EB',
          'coral-mid': '#FAD4C3',
          'coral-dark': '#8C3216',
          green: '#2A9D72',
          'green-light': '#E8F7F1',
          'green-dark': '#145C3E',
          navy: '#1E2D3D',
          cream: '#FDF6F0',
          'neutral-50': '#F2EAE2',
          'neutral-100': '#D9CFC6',
          'neutral-300': '#B0A89E',
          'neutral-500': '#7A7269',
          'neutral-700': '#4A4440',
          'neutral-800': '#2C2620',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
