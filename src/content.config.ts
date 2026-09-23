import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// 注意：Astro 7 里 Zod 从 'astro/zod' 导入，不再是 'astro:content'
import { z } from 'astro/zod';

const posts = defineCollection({
  // 文章放在 src/content/posts/ 下，支持子目录分类
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    // 发布日期
    pubDate: z.coerce.date(),
    // 更新日期（可选）
    updatedDate: z.coerce.date().optional(),
    // 标签
    tags: z.array(z.string()).default([]),
    // 是否草稿：草稿只在本地 dev 可见，不会出现在线上
    draft: z.boolean().default(false),
    // 置顶
    pinned: z.boolean().default(false),
    // 封面图（可选，放在 public/ 下的路径）
    cover: z.string().optional(),
  }),
});

export const collections = { posts };
