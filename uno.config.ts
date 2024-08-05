import { defineConfig, presetIcons, presetUno, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetTypography(),
  ],
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