import { defineConfig, presetIcons, presetUno, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: ['Inter:400,500,600,700,800'],
        mono: ['JetBrains Mono:400,500,600'],
      },
    }),
  ],
  theme: {
    colors: {
      brand: {
        50: '#eef9ff',
        100: '#dcf2ff',
        200: '#b3e4ff',
        300: '#7ed0ff',
        400: '#3cb8ff',
        500: '#0a96f0',
        600: '#0074c8',
        700: '#005ca0',
        800: '#064d84',
        900: '#0a416c',
      },
      accent: {
        400: '#22d3ee',
        500: '#06b6d4',
        600: '#0891b2',
      },
    },
    fontFamily: {
      sans: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    boxShadow: {
      'glow': '0 0 24px -4px rgba(10, 150, 240, 0.35)',
      'glow-accent': '0 0 28px -6px rgba(6, 182, 212, 0.45)',
    },
  },
  shortcuts: {
    'btn': 'inline-flex items-center gap-2 rounded-lg font-medium transition duration-200',
    'btn-primary': 'btn bg-brand-500 hover:bg-brand-400 text-white shadow-glow',
    'btn-ghost': 'btn border border-white/10 hover:bg-white/5 text-zinc-200',
    'chip': 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
    'card': 'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur',
  },
})
