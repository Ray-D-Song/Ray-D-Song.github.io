import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt()

export async function GET(context) {
  const blogs = await getCollection('blog')
  return rss({
    title: `Ray-D-Song's Blog`,
    description: 'Just for fun.',
    site: 'https://ray-d-song.com',
    items: blogs.map((item) => ({
      title: item.title,
      pubDate: item.data.date,
      link: `https://ray-d-song.com/blog/${item.slug}`,
      content: sanitizeHtml(parser.render(item.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
      }),
    }))
  })
}