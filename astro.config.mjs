import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";
import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import embeds from 'astro-embed/integration';
import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers';
import { exec } from 'child_process';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      {
        name: 'virtual:pagefind',
        resolveId(id) {
          if (id === 'virtual:pagefind/pagefind') {
            return '\0virtual:pagefind/pagefind'
          }
        },
        load(id) {
          if (id === '\0virtual:pagefind/pagefind') {
            return `
              export default window.pagefind
            `
          }
        }
      }
    ]
  },
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
    }),
    vue(),
    embeds(),
    mdx(),
    {
      name: 'pagefind',
      hooks: {
        'astro:build:done': async () => {
          if (process.env.NODE_ENV === 'production') {
            await new Promise((resolve) => {
              exec('npx pagefind --source dist', (error) => {
                if (error) {
                  console.error(`执行出错: ${error}`);
                  return;
                }
                resolve();
              });
            });
          }
        },
      },
    },
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
      themes: {
        light: 'github-light',
        dark: 'nord'
      },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight()
      ]
    }
  },
  output: "static"
});