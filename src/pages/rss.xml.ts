import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { SITE, absoluteUrl } from '../site.config.mjs';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  // 站点根地址 + 部署子路径，例如 https://ktcb0922.github.io/boke
  const base = absoluteUrl('/').replace(/\/$/, '');

  const items = posts
    .map((post) => {
      const url = `${base}/posts/${post.id}/`;
      const categories = post.data.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');

      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(post.data.description || post.data.title)}</description>
${categories}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <description>${escapeXml(SITE.description)}</description>
    <link>${base}/</link>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <language>${SITE.lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
