import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/post' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const publicationCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publication' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    authors: z.array(z.string()),
    journal: z.string(),
    doi: z.string().url(),
    highlightedAuthor: z.string().optional().default('Zongwei Liu'),
    lang: z.enum(['en', 'zh']).optional().default('en'),
    summary: z.string().optional(),
  }),
});

const projectCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    date: z.date().optional(),
    ongoing: z.boolean().optional().default(false),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  post: postCollection,
  publication: publicationCollection,
  projects: projectCollection,
};
