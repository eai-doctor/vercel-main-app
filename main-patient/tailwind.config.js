/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
        medical: {
          50: '#f0f4f8',
          100: '#e2e8f0',
          200: '#cbd5e1',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(15, 23, 42, 0.1)',
        'card-hover': '0 10px 30px rgba(15, 23, 42, 0.12)',
        glow: '0 0 40px rgba(59, 130, 246, 0.25)',
      },
    },
  },
  plugins: [],
}