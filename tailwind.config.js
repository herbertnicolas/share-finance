/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'sf-bg': '#FFF7DC',
        'sf-primary': '#007C82',
        'sf-primary-soft': '#E6F3F4',
        'sf-card': '#FFEFB3',
        'sf-danger': '#FF6B6B',
        'sf-text': '#111827',
        'sf-muted': '#6B7280',
      },
      borderRadius: {
        '3xl': 30,
      },
      boxShadow: {
        'soft-lg': '0 16px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
