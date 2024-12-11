import { defineConfig, presetIcons, presetUno, presetTypography } from 'unocss'
import { icons } from '@iconify-json/fe/index.js'
import presetChinese, { chineseTypography } from 'unocss-preset-chinese'

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
  },
  presets: [
    presetUno(),
    presetIcons(),
    presetTypography(),
    chineseTypography(),
    presetChinese(),
  ],
  safelist: Object.keys(icons.icons).map(icon => `i-fe-${icon}`).slice(0, 30),
  rules: [
    ['text-light', {
      color: '#24292f', // 更深的文字颜色，提高对比度
    }],
    ['text-dark', {
      color: '#D0D0D0',
    }],
    ['bg-light', {
      background: '#ffffff', // 纯白背景
    }],
    ['bg-dark', {
      background: '#1B1B1F',
    }],
    ['bg-card-light', {
      background: '#f6f8fa', // 略微灰色的卡片背景
    }],
  ],
})