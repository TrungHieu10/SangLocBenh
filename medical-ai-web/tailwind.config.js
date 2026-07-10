/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Core palette
        midnight: {
          DEFAULT: 'rgb(var(--c-midnight) / <alpha-value>)',
          50: 'rgb(var(--c-midnight-50) / <alpha-value>)',
          100: 'rgb(var(--c-midnight-100) / <alpha-value>)',
          200: 'rgb(var(--c-midnight-200) / <alpha-value>)',
          300: 'rgb(var(--c-midnight-300) / <alpha-value>)',
          400: 'rgb(var(--c-midnight-400) / <alpha-value>)',
          500: 'rgb(var(--c-midnight-500) / <alpha-value>)',
          600: '#3a5a7c',
          700: '#4a6d8e',
          800: '#5c82a0',
          900: '#7099b2',
        },
        cyan: {
          DEFAULT: 'rgb(var(--c-cyan) / <alpha-value>)',
          50: 'rgb(var(--c-cyan-50) / <alpha-value>)',
          100: '#b3f0ff',
          200: '#80e6ff',
          300: '#4ddbff',
          400: 'rgb(var(--c-cyan-400) / <alpha-value>)',
          500: 'rgb(var(--c-cyan-500) / <alpha-value>)',
          600: '#00b8db',
          700: '#009cb7',
          800: '#008093',
          900: '#00646f',
        },
        teal: {
          DEFAULT: 'rgb(var(--c-teal) / <alpha-value>)',
          50: 'rgb(var(--c-teal-50) / <alpha-value>)',
          100: '#b3ffed',
          200: '#80ffe1',
          300: '#4dffd5',
          400: 'rgb(var(--c-teal-400) / <alpha-value>)',
          500: 'rgb(var(--c-teal-500) / <alpha-value>)',
          600: '#00d4b7',
          700: '#00b39a',
          800: '#00917d',
          900: '#007060',
        },
        glass: {
          DEFAULT: 'rgb(var(--c-glass) / <alpha-value>)',
          50: 'rgb(var(--c-glass-50) / <alpha-value>)',
          100: 'rgb(var(--c-glass-100) / <alpha-value>)',
          200: 'rgb(var(--c-glass-200) / <alpha-value>)',
          300: 'rgb(var(--c-glass-300) / <alpha-value>)',
          400: 'rgb(var(--c-glass-400) / <alpha-value>)',
          500: 'rgb(var(--c-glass-500) / <alpha-value>)',
          600: 'rgb(var(--c-glass-600) / <alpha-value>)',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glow-cyan': '0 0 24px rgba(0, 212, 255, 0.25)',
        'glow-teal': '0 0 24px rgba(0, 245, 212, 0.25)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.25)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.25)',
        'soft': '0 2px 12px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cyan-teal': 'linear-gradient(135deg, #00D4FF, #00F5D4)',
        'gradient-blue-purple': 'linear-gradient(135deg, #00D4FF, #7C3AED)',
      },
    },
  },
  plugins: [],
}