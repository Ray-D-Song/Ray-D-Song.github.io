import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [
    unocss({
    injectReset: true
    }),
    sitemap({
    i18n: {
      defaultLocale: 'zh-CN',
      locales: {
        'zh-CN': 'zh-CN',
        en: 'en'
      }
    }
  }), vue(), mdx()],
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
  output: "static",
  adapter: cloudflare()
});