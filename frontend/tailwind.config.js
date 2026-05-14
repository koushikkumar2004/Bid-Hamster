/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#070B1A',
        sidebar: '#0F172A',
        card: '#111827',
        primary: '#3B82F6',
        accent: '#7C3AED',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#1E3A5F',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px #3B82F6, 0 0 20px #3B82F620' },
          '50%': { boxShadow: '0 0 20px #3B82F6, 0 0 40px #3B82F640' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #070B1A 0%, #0F172A 50%, #1a0533 100%)',
        'card-gradient': 'linear-gradient(135deg, #111827 0%, #1a1f35 100%)',
        'primary-gradient': 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
      },
    },
  },
  plugins: [],
};
