#!/usr/bin/env node
/**
 * 新建文章小工具：npm run new
 * 会问你标题、文件名、标签、摘要，然后在 src/content/posts/ 下生成带 frontmatter 的 md 文件。
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const postsDir = path.join(root, 'src', 'content', 'posts');

const today = new Date();
const dateStamp = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');

const rl = createInterface({ input: process.stdin, output: process.stdout });

const title = (await rl.question('文章标题：')).trim();
if (!title) {
  console.error('✗ 标题不能为空');
  rl.close();
  process.exit(1);
}

const slugInput = (await rl.question('文件名（英文/拼音，可留空）：')).trim();
const tagsInput = (await rl.question('标签（逗号分隔，可留空）：')).trim();
const description = (await rl.question('一句话摘要（可留空）：')).trim();
rl.close();

// 文件名：优先用你输入的 slug，否则用日期
const slug =
  (slugInput || dateStamp)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || dateStamp;

const tags = tagsInput
  .split(/[,，]/)
  .map((tag) => tag.trim())
  .filter(Boolean);

const frontmatter = [
  '---',
  `title: ${title}`,
  `description: ${description}`,
  `pubDate: ${dateStamp}`,
  `tags: [${tags.join(', ')}]`,
  'draft: true',
  '---',
  '',
  '在这里开始写正文。',
  '',
  '## 第一个小标题',
  '',
  '```bash',
  'echo "代码块会自动高亮"',
  '```',
  '',
  '> 写完把 frontmatter 里的 `draft: true` 删掉或改成 `false`，文章才会在线上出现。',
  '',
].join('\n');

await mkdir(postsDir, { recursive: true });

const filePath = path.join(postsDir, `${slug}.md`);
try {
  await access(filePath);
  console.error(`✗ 文件已存在，换个文件名：${path.relative(root, filePath)}`);
  process.exit(1);
} catch {
  // 不存在才继续
}

await writeFile(filePath, frontmatter, 'utf8');

console.log(`\n✓ 已创建 ${path.relative(root, filePath)}`);
console.log('  本地预览：npm run dev');
console.log('  记得写完把 draft: true 改成 false 才会发布。\n');
