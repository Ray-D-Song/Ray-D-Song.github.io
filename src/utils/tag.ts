import { getCollection } from 'astro:content'

async function getTags() {
  return Array.from(
    new Set(
      (await getCollection("blog")).map((blog) => blog.data.tag).flat(),
    ),
  );
}

export {
  getTags
}