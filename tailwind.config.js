/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cyber: {
          black: '#0a0a0f',
          dark: '#12121a',
          darker: '#08080c',
          gray: '#1a1a24',
          cyan: '#00fff9',
          pink: '#ff00aa',
          purple: '#bf40ff',
          yellow: '#ffee00',
          green: '#39ff14',
          blue: '#4488ff',
          orange: '#ff6600',
          red: '#ff0044',
        },
      },
      boxShadow: {
        'cyber-cyan': '0 0 10px rgba(0, 255, 249, 0.3), 0 0 30px rgba(0, 255, 249, 0.1)',
        'cyber-pink': '0 0 10px rgba(255, 0, 170, 0.3), 0 0 30px rgba(255, 0, 170, 0.1)',
        'cyber-purple': '0 0 10px rgba(191, 64, 255, 0.3), 0 0 30px rgba(191, 64, 255, 0.1)',
      },
      animation: {
        'glitch': 'glitch 0.3s ease-in-out',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'flicker': 'flicker 3s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float-up': 'float-up 3s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%': { clipPath: 'inset(40% 0 61% 0)', transform: 'translate(-2px, 2px)' },
          '20%': { clipPath: 'inset(92% 0 1% 0)', transform: 'translate(1px, -3px)' },
          '40%': { clipPath: 'inset(43% 0 1% 0)', transform: 'translate(-1px, 3px)' },
          '60%': { clipPath: 'inset(25% 0 58% 0)', transform: 'translate(3px, 1px)' },
          '80%': { clipPath: 'inset(54% 0 7% 0)', transform: 'translate(-3px, -2px)' },
          '100%': { clipPath: 'inset(58% 0 43% 0)', transform: 'translate(2px, 1px)' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.6' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 249, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 249, 0.5), 0 0 40px rgba(0, 255, 249, 0.2)' },
        },
        'float-up': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
