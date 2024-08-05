import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blogs = await getCollection('blog')
  return rss({
    title: `Ray-D-Song's Blog`,
    description: 'Just for fun.',
    site: context.site,
    items: blogs.map((blog) => ({
      title: blog.data.title,
      description: blog.body.slice(0, 100),
      pubDate: blog.data.date,
      link: `https://ray-d-song.com/blog/${blog.slug}`,
      content: blog.render()
    })),
  })
}