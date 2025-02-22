import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt()

export async function GET(context) {
  const blogs = await getCollection('blog')

  const filteredBlogs = blogs
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
    );

  return rss({
    title: `Ray-D-Song's Blog`,
    description: '我正在和日常战斗',
    site: 'https://ray-d-song.com',
    items: filteredBlogs.map((item) => ({
      title: item.data.title,
      pubDate: new Date(item.data.date),
      link: `https://ray-d-song.com/blog/${item.slug}`,
      content: sanitizeHtml(parser.render(item.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
      }),
    }))
  })
}