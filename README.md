# 技术笔记博客

基于 [Astro](https://astro.build) 的静态博客，托管在 Cloudflare Pages。
全站无后端，写 Markdown 就是写文章。

**特性**

- 极快的静态页面，零 JS 框架运行时（只有主题切换和搜索用了一点点原生 JS）
- 明暗双主题，代码块高亮跟着一起切换，无闪白
- 文章目录自动生成 + 滚动高亮
- 标签、归档、上下篇导航、RSS
- giscus 评论（基于 GitHub Discussions，免费无广告）
- Pagefind 站内全文搜索（构建时生成索引，不需要服务端）
- 推送即自动部署（Cloudflare Pages 监听 main 分支）

---

## 部署

托管在 Cloudflare Pages，GitHub 仓库只负责存代码。

| 配置项 | 值 |
| --- | --- |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| Node 版本 | 见 `.nvmrc`（22） |

改站点域名/路径只需动 `src/site.config.mjs` 里的 `url` 和 `base`。
