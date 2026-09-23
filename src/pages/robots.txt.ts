import type { APIRoute } from 'astro';
import { absoluteUrl } from '../site.config.mjs';

export const GET: APIRoute = () => {
  // 站点根地址 + 部署子路径，例如 https://ktcb0922.github.io/boke
  const base = absoluteUrl('/').replace(/\/$/, '');

  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
