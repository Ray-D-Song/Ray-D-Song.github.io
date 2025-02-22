import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";
import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import tomorrowNightTheme from './config/tomorrowNightTheme.json'
import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers';

// https://astro.build/config
export default defineConfig({
  integrations: [
    unocss(),
    sitemap(),
    vue(),
    mdx(),
  ],
  site: 'https://ray-d-song.com',
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      langs: [
        'javascript', 'html', 'css',
        'json', 'typescript', 'markdown',
        'shell', 'yaml', 'dockerfile',
        'go', 'python', 'rust',
        'java', 'php', 'ruby',
        'sql', 'swift', 'kotlin',
        'c', 'cpp', 'csharp',
        'vue'
      ],
      wrap: true,
      theme: tomorrowNightTheme,
      defaultColor: 'dark',
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight()
      ]
    }
  },
  output: "static"
});