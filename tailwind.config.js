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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
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
        'cyber-cyan': '0 0 12px rgba(0, 255, 249, 0.25), 0 0 40px rgba(0, 255, 249, 0.08)',
        'cyber-pink': '0 0 12px rgba(255, 0, 170, 0.25), 0 0 40px rgba(255, 0, 170, 0.08)',
        'cyber-sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'cyber-md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'cyber-lg': '0 8px 30px rgba(0, 0, 0, 0.5)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
