/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cinema-bg': '#0B0B0A',
        'cinema-alt': '#151412',
        'cinema-card': '#1B1916',
        'cinema-text': '#F7F0E5',
        'cinema-secondary': '#B5AA9A',
        'cinema-amber': '#F5A34A',
        'cinema-gold': '#C99A5B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'cinema': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'cinema-lg': '0 12px 48px rgba(0, 0, 0, 0.5)',
        'amber-glow': '0 0 24px rgba(245, 163, 74, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'reveal': 'reveal 0.6s ease-out forwards',
        'reveal-up': 'revealUp 0.7s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
