import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";
import { presetIcons, presetUno, presetTypography } from 'unocss';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [unocss({
    injectReset: true
  })],
  site: 'https://ray-d-song.com',
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      wrap: true,
      themes: {
        light: 'rose-pine-dawn',
        dark: 'tokyo-night'
      }
    }
  },
  output: "server",
  adapter: cloudflare()
});