import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";
import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [unocss({
    injectReset: true
  }), sitemap({
    i18n: {
      defaultLocale: 'zh-CN',
      locales: {
        'zh-CN': 'zh-CN',
        en: 'en'
      }
    }
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