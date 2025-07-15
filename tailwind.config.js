/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'canvas-bg': '#f8f9fa',
        'panel-bg': '#ffffff',
        'primary-blue': '#2563eb',
        'success-green': '#10b981',
        'danger-red': '#ef4444',
      },
    },
  },
  plugins: [],
};