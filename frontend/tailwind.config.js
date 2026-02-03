/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // White & Golden Theme
        primary: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE58F',
          300: '#FFD666',
          400: '#FFC53D',
          500: '#FFB800', // Main Golden
          600: '#D48806',
          700: '#AD6800',
          800: '#874D00',
          900: '#613400',
        },
        golden: {
          light: '#F3E5AB', // Champagne
          DEFAULT: '#D4AF37', // Metallic Gold
          dark: '#AA8C2C', // Dark Gold
          darker: '#874D00',
          50: '#FFFEF0',
          100: '#F3E5AB',
          200: '#E6D28C',
          300: '#D4AF37',
          400: '#C5A028',
          500: '#B69121',
          600: '#AA8C2C',
          700: '#8C7324',
          800: '#6E5A1C',
          900: '#504114',
        },
        background: {
          white: '#FFFFFF',
          light: '#F8F9FA',
          lighter: '#F5F5F5',
          cream: '#FFFEF9',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#333333',
          tertiary: '#666666',
          light: '#999999',
        },
        accent: {
          black: '#000000',
          dark: '#1A1A1A',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
          pending: '#F59E0B',
          approved: '#10B981',
          rejected: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Oswald', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'golden': '0 4px 14px 0 rgba(255, 165, 0, 0.39)',
        'golden-lg': '0 10px 40px 0 rgba(255, 165, 0, 0.3)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      backgroundImage: {
        'gradient-golden': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'gradient-golden-radial': 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
        'gradient-white': 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 165, 0, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 165, 0, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
