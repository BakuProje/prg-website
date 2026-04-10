/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        neon: {
          blue: '#00d4ff',
          purple: '#8b5cf6',
          magenta: '#e040fb',
          pink: '#ff2d95',
          cyan: '#00e5ff',
        },
        dark: {
          900: '#0a0a0f',
          800: '#0d0d14',
          700: '#12121c',
          600: '#1a1a2e',
          500: '#22223a',
        }
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 60px rgba(0, 212, 255, 0.1)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)',
        'neon-magenta': '0 0 20px rgba(224, 64, 251, 0.3), 0 0 60px rgba(224, 64, 251, 0.1)',
        'neon-pink': '0 0 20px rgba(255, 45, 149, 0.3), 0 0 60px rgba(255, 45, 149, 0.1)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
