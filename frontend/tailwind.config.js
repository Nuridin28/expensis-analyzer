/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Text colors
    'text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-600',
    'text-yellow-600', 'text-orange-600', 'text-pink-600', 'text-indigo-600',
    'text-cyan-600', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    // Background colors
    'bg-blue-100', 'bg-green-100', 'bg-red-100', 'bg-purple-100',
    'bg-yellow-100', 'bg-orange-100', 'bg-pink-100', 'bg-indigo-100',
    'bg-cyan-100', 'bg-gray-100', 'bg-gray-50', 'bg-white',
    // Gradient backgrounds
    'bg-green-50', 'bg-red-50', 'bg-blue-50', 'bg-indigo-50',
    'bg-purple-50', 'bg-amber-50', 'bg-orange-50', 'bg-emerald-50',
    'bg-rose-50', 'bg-violet-50',
    // Border colors
    'border-green-200', 'border-red-200', 'border-blue-200', 'border-purple-200',
    'border-amber-200', 'border-yellow-200', 'border-orange-200', 'border-pink-200',
    'border-indigo-200', 'border-cyan-200', 'border-gray-200', 'border-gray-100',
    // Priority colors
    'bg-red-500', 'bg-yellow-500', 'bg-green-500',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}

