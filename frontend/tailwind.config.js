/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // ✅ class-based dark mode — toggled via <html class="dark">
  theme: {
    extend: {
      colors: {
        // ✅ Dark mode surface palette
        dark: {
          50:  '#f9fafb',
          100: '#1a1a1a',
          200: '#242424',
          300: '#2a2a2a',
          400: '#333333',
          500: '#3d3d3d',
          600: '#525252',
          700: '#6b7280',
          800: '#9ca3af',
          900: '#f3f4f6',
        },
      },
      transitionProperty: {
        // ✅ Custom transition for theme switching
        'theme': 'background-color, border-color, color, box-shadow',
      },
      transitionDuration: {
        'theme': '200ms',
      },
      boxShadow: {
        // ✅ Dark mode aware shadows
        'dark-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 12px 32px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        // ✅ Voice button pulsing animation
        voicePulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
        },
        // ✅ Sound bar animation for listening indicator
        soundBar: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        // ✅ Animation utility classes
        voicePulse: 'voicePulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        soundBar: 'soundBar 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};