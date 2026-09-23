import type { APIRoute } from 'astro';
import { absoluteUrl } from '../site.config.mjs';

export const GET: APIRoute = () => {
  // 站点根地址 + 部署路径前缀，例如 https://boke.pages.dev
  const base = absoluteUrl('/').replace(/\/$/, '');

  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
