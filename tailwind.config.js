/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['IBM Plex Mono', 'Courier New', 'monospace'],
        display: ['Special Elite', 'IBM Plex Mono', 'monospace'],
        mono:    ['IBM Plex Mono', 'Courier New', 'monospace'],
      },
      colors: {
        cyber: {
          black:  'rgba(var(--bg-rgb), <alpha-value>)',
          dark:   'rgba(var(--surface-rgb), <alpha-value>)',
          darker: 'rgba(var(--darker-rgb), <alpha-value>)',
          gray:   '#1a1a18',
          pink:   'rgba(var(--primary-rgb), <alpha-value>)',
          cyan:   'rgba(var(--accent-rgb), <alpha-value>)',
          purple: 'rgba(var(--purple-rgb), <alpha-value>)',
          fg:     'rgba(var(--fg-rgb), <alpha-value>)',
        },
      },
      boxShadow: {
        'cyber-pink': '3px 3px 0 rgba(0,0,0,0.08)',
        'cyber-cyan': '3px 3px 0 rgba(0,0,0,0.06)',
        'cyber-sm':   '1px 1px 0 rgba(0,0,0,0.06)',
        'cyber-md':   '3px 3px 0 rgba(0,0,0,0.08)',
        'cyber-lg':   '5px 5px 0 rgba(0,0,0,0.1)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
