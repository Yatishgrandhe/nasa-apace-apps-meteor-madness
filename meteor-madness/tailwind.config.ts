import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'secondary-bg': 'var(--secondary-bg)',
        'primary-blue': 'var(--primary-blue)',
        'primary-blue-dark': 'var(--primary-blue-dark)',
        'accent-orange': 'var(--accent-orange)',
        'accent-red': 'var(--accent-red)',
        'success-green': 'var(--success-green)',
        'warning-yellow': 'var(--warning-yellow)',
        'info-cyan': 'var(--info-cyan)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        'card-bg': 'var(--card-bg)',
        'hover-bg': 'var(--hover-bg)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'sparkle': 'sparkle 20s linear infinite',
      },
      keyframes: {
        sparkle: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-100px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
