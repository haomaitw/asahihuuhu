import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sea: {
          50: '#F2F8FB',
          100: '#E4F0F6',
          200: '#C7E0EB',
          300: '#9CC8DA',
          400: '#6FAEC5',
          500: '#4D94B0',
          600: '#3A7892',
          700: '#2F6177',
          800: '#274E60',
          900: '#1F3D4C',
        },
        paper: {
          50: '#FBF8F3',
          100: '#F5EFE6',
          200: '#EBE1D0',
        },
        ink: '#2A2A2A',
        // Admin palette — hardcoded so Tailwind JIT can statically generate all classes
        'adm-bg': {
          base:     '#FAF7F2',
          elevated: '#FFFFFF',
          sunken:   '#F5F0E8',
          overlay:  'rgba(20,18,14,0.45)',
        },
        'adm-border': {
          subtle:  '#EFEAE0',
          default: '#E5DFD2',
          strong:  '#D4CCB8',
          focus:   '#8B6F47',
        },
        'adm-text': {
          primary:   '#1A1614',
          secondary: '#5C544A',
          tertiary:  '#8B8275',
          disabled:  '#B8B0A1',
          inverse:   '#FAF7F2',
        },
        'adm-brand': {
          50:  '#F9F4ED',
          100: '#F1E5D2',
          200: '#E5CFA8',
          300: '#D4B07C',
          400: '#BF8E54',
          500: '#A67139',
          600: '#8B5A2C',
          700: '#704624',
          800: '#56361D',
          900: '#3D2715',
        },
        'adm-success': {
          50:  '#F0F4EE',
          500: '#6B8E5A',
          600: '#577549',
        },
        'adm-warning': {
          50:  '#FBF5E8',
          500: '#C99846',
          600: '#A87C30',
        },
        'adm-danger': {
          50:  '#F9EEEA',
          500: '#B85042',
          600: '#963F33',
        },
        'adm-info': {
          50:  '#EDF1F4',
          500: '#4A6B7A',
          600: '#3A5560',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-tc)', 'var(--font-noto-jp)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-noto-serif-tc)', 'serif'],
      },
      maxWidth: {
        content: '1200px',
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }],
        'xs':  ['12px', { lineHeight: '16px' }],
        'sm':  ['13px', { lineHeight: '20px' }],
        'base':['14px', { lineHeight: '22px' }],
        'lg':  ['16px', { lineHeight: '24px' }],
        'xl':  ['18px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
      },
      borderRadius: {
        card: '16px',
        image: '12px',
        // Admin-specific border radius shortcuts
        'adm-sm':  '4px',
        'adm-md':  '6px',
        'adm-lg':  '8px',
        'adm-xl':  '12px',
        'adm-2xl': '16px',
      },
      // Admin sidebar widths
      width: {
        'sidebar':           '240px',
        'sidebar-collapsed': '64px',
      },
      height: {
        'topbar': '56px',
      },
      keyframes: {
        'page-overlay': {
          '0%': { opacity: '0' },
          '15%': { opacity: '1' },
          '75%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'logo-breathe': {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(4px)' },
          '25%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '75%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(1.04) translateY(-2px)' },
        },
        'underline-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'page-overlay': 'page-overlay 1s ease-in-out forwards',
        'logo-breathe': 'logo-breathe 1s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
