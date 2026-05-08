import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand blue — matches asahihuuhu.com #5aa0d7 exactly ───────
        sea: {
          50:  '#eef6fb',
          100: '#d5e9f7',
          200: '#a8d2ef',
          300: '#72b6e5',
          400: '#5aa0d7',  // ← BRAND: matches original site
          500: '#3e88c3',  // hover / primary button
          600: '#306faa',  // deeper hover
          700: '#265989',
          800: '#1e4569',
          900: '#16364f',
        },
        // ── Warm paper / off-white ─────────────────────────────────────
        paper: {
          50:  '#faf8f4',
          100: '#f2ede3',
          200: '#e8dfd0',
        },
        // ── Brand aliases (keep backward compat) ──────────────────────
        brand: {
          50:  '#eef6fb',
          100: '#d5e9f7',
          200: '#a8d2ef',
          300: '#72b6e5',
          400: '#5aa0d7',
          500: '#3e88c3',
          600: '#306faa',
          700: '#265989',
          800: '#1e4569',
          900: '#16364f',
        },
        sand: {
          50:  '#faf7f2',
          100: '#f2ede3',
          200: '#e8dfd0',
          300: '#d9ccb5',
          400: '#c9b89a',
        },
        // ── Text / dark — matches original #353535 ────────────────────
        ink: '#353535',

        // ── Admin palette (untouched) ──────────────────────────────────
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
        'adm-success': { 50: '#F0F4EE', 500: '#6B8E5A', 600: '#577549' },
        'adm-warning': { 50: '#FBF5E8', 500: '#C99846', 600: '#A87C30' },
        'adm-danger':  { 50: '#F9EEEA', 500: '#B85042', 600: '#963F33' },
        'adm-info':    { 50: '#EDF1F4', 500: '#4A6B7A', 600: '#3A5560' },
      },

      fontFamily: {
        sans:   ['var(--font-noto-tc)', 'var(--font-noto-jp)', 'system-ui', 'sans-serif'],
        serif:  ['var(--font-noto-serif-tc)', 'serif'],
        averia: ['var(--font-averia)', 'cursive'],   // decorative EN headings / eyebrows
      },

      fontSize: {
        // ── Frontend scale (larger = more readable) ───────────────────
        '2xs': ['11px',  { lineHeight: '16px' }],
        'xs':  ['12px',  { lineHeight: '18px' }],
        'sm':  ['14px',  { lineHeight: '22px' }],
        'base':['16px',  { lineHeight: '26px' }],
        'lg':  ['18px',  { lineHeight: '28px' }],
        'xl':  ['20px',  { lineHeight: '30px' }],
        '2xl': ['24px',  { lineHeight: '34px' }],
        '3xl': ['30px',  { lineHeight: '40px' }],
        '4xl': ['36px',  { lineHeight: '46px' }],
        '5xl': ['48px',  { lineHeight: '56px' }],
      },

      maxWidth: {
        content: '1128px',   // matches original --size-container-lg
        'content-md': '936px',
        'content-sm': '656px',
      },

      borderRadius: {
        card:  '16px',
        image: '12px',       // matches original --size-radius-sm
        pill:  '100px',      // matches original --size-radius-lg (pill buttons)
        blob:  '40px',       // matches original --size-radius-md
        // Admin
        'adm-sm': '4px', 'adm-md': '6px', 'adm-lg': '8px',
        'adm-xl': '12px', 'adm-2xl': '16px',
      },

      width: {
        'sidebar':           '240px',
        'sidebar-collapsed': '64px',
      },
      height: {
        topbar: '56px',
      },

      keyframes: {
        // ── Page transition ────────────────────────────────────────────
        'page-overlay': {
          '0%':   { opacity: '0' },
          '15%':  { opacity: '1' },
          '75%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'logo-breathe': {
          '0%':   { opacity: '0', transform: 'scale(0.92) translateY(4px)' },
          '25%':  { opacity: '1', transform: 'scale(1)   translateY(0)' },
          '75%':  { opacity: '1', transform: 'scale(1)   translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(1.04) translateY(-2px)' },
        },
        // ── Marquee (infinite horizontal scroll) ──────────────────────
        'marquee': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        // ── Fade up (scroll reveal) ────────────────────────────────────
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        // ── Fade in (pure opacity) ─────────────────────────────────────
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },

      animation: {
        'page-overlay':  'page-overlay 1s ease-in-out forwards',
        'logo-breathe':  'logo-breathe 1s ease-in-out forwards',
        'marquee':       'marquee 32s linear infinite',
        'marquee-slow':  'marquee 48s linear infinite',
        'fade-up':       'fade-up 0.7s ease-out both',
        'fade-in':       'fade-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
