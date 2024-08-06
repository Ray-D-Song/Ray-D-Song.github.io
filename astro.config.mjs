import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";

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
      themes: {
        light: 'rose-pine-dawn',
        dark: 'tokyo-night'
      }
    }
  },
  output: "hybrid",
  adapter: cloudflare()
});