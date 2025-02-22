import { defineConfig, presetIcons, presetUno } from 'unocss'
import { icons } from '@iconify-json/fe/index.js'

export default defineConfig({
  theme: {
    keyframes: {
      'fade-in': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
    },
    animation: {
      'fade-in': 'fade-in 2s ease-in-out',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    }
  },
  presets: [
    presetIcons(),
    presetUno()
  ],
  safelist: Object.keys(icons.icons).map(icon => `i-fe-${icon}`).slice(0, 30),
})