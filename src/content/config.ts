import { defineCollection, z } from 'astro:content'

const blogs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    cover: z.string(),
    tag: z.array(z.string()),
    remark: z.optional(z.string()),
    card: z.optional(z.boolean()).default(true),
    description: z.optional(z.string()),
  }),
});

export const collections = {
  'blog': blogs,
};