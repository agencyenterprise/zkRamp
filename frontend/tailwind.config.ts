import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        manrope: ['Manrope', ...defaultTheme.fontFamily.sans],
        azaretMono: ['Azaret Mono', ...defaultTheme.fontFamily.mono],
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        gradient:
          'linear-gradient(180deg, #161616 0%, rgba(22, 22, 22, 0.00) 39.72%, rgba(22, 22, 22, 0.00) 88.69%, #161616 100%)',
      },
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        outlineBorder: 'white',
        outlineText: 'white',
        outlineBackground: '#18181B',
        surface2: '#09090B',
        subtlest: '#A1A1AA',
        surfaceHover: '#27272A',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: '#BEF264',
          foreground: '#09090B',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        warning: colors.yellow[400],
        success: colors.green[400],
        error: colors.red[400],
        info: colors.blue[400],
      },
      borderRadius: {
        lg: 'var(--radius)',
        DEFAULT: 'calc(var(--radius) - 2px)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-fast': 'spin 0.6s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
