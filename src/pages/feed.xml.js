import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt()

export async function GET(context) {
  const blogs = await getCollection('blog')
  
  // 根据 URL 参数判断语言
  const url = new URL(context.request.url)
  const lang = url.searchParams.get('lang') || 'zh-cn'
  
  // 过滤语言并按时间排序
  const filteredBlogs = blogs
    .filter(blog => blog.slug.startsWith(lang))
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
    
  return rss({
    title: `Ray-D-Song's Blog`,
    description: lang === 'zh-cn' ? '技术博客' : 'Tech Blog',
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