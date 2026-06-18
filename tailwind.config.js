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
          gray:   'rgba(var(--surface-alt-rgb), <alpha-value>)',
          pink:   'rgba(var(--primary-rgb), <alpha-value>)',
          cyan:   'rgba(var(--accent-rgb), <alpha-value>)',
          purple: 'rgba(var(--purple-rgb), <alpha-value>)',
          amber:  'rgba(var(--amber-rgb), <alpha-value>)',
          fg:     'rgba(var(--fg-rgb), <alpha-value>)',
        },
      },
      boxShadow: {
        'cyber-pink': '2px 2px 0 rgba(var(--primary-rgb), 0.15)',
        'cyber-cyan': '2px 2px 0 rgba(var(--accent-rgb), 0.15)',
        'cyber-sm':   '1px 1px 0 rgba(var(--fg-rgb), 0.06)',
        'cyber-md':   '3px 3px 0 rgba(var(--fg-rgb), 0.08)',
        'cyber-lg':   '5px 5px 0 rgba(var(--fg-rgb), 0.1)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
