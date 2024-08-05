import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro"
import { presetIcons, presetUno, presetTypography } from 'unocss'

// https://astro.build/config
export default defineConfig({
  integrations: [
    unocss({
      injectReset: true,
    })
  ],
  markdown: {
    shikiConfig: {
      wrap: true,
      themes: {
        light: 'rose-pine-dawn',
        dark: 'tokyo-night',
      }
    }
  }
})
