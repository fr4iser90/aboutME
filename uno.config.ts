import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  shortcuts: {
    'glass-card': 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl',
    'glass-hover': 'hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:-translate-y-2',
    'neon-text': 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent',
    'btn-neon': 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg px-6 py-3 text-white hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/25',
  },
  theme: {
    colors: {
      dark: {
        950: '#050911',
      },
      neon: {
        blue: '#00d4ff',
        purple: '#8b5cf6',
        pink: '#ec4899',
      }
    }
  },
  // Turbopack Integration
  transformers: [],
  extractors: [],
})
