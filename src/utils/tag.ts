import { getCollection } from 'astro:content'

type Lang = 'en' | 'zh-cn' | '*'

async function getTags(lang: string) {
  return Array.from(new Set(
    (await getCollection('blog'))
      .filter(blog => {
        if(lang === '*') return true
        return blog.slug.startsWith(`${lang}`)
      })
      .map(blog => blog.data.tag)
      .flat()
  ))
}

export {
  getTags
}