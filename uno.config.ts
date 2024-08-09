import { defineConfig, presetIcons, presetUno, presetTypography } from 'unocss'
import { icons } from '@iconify-json/fe/index.js'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetTypography(),
  ],
  safelist: Object.keys(icons.icons).map(icon => `i-fe-${icon}`).slice(0, 30),
  rules: [
    ['text-light', {
      color: '#333333',
    }],
    ['text-dark', {
      color: '#D0D0D0',
    }],
    ['bg-light', {
      background: '#F5EFD9',
    }],
    ['bg-dark', {
      background: '#121212',
    }],
  ],
})