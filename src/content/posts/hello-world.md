---
title: 写在前面：这个博客怎么用
description: 博客已经搭好了。这篇说明写在哪、怎么发、哪些地方可以改。
pubDate: 2026-09-23
tags: [公告]
pinned: true
draft: false
---

博客已经跑起来了。这篇是给你自己的使用说明，看完可以直接删掉。

## 文章放在哪

所有文章都在 `src/content/posts/` 目录里，一个 `.md` 文件就是一篇。文件名会变成网址的一部分，所以建议用英文或拼音：

```
src/content/posts/hello-world.md   →   /posts/hello-world/
```

也支持建子目录做分类，比如 `src/content/posts/notes/xxx.md` 网址就是 `/posts/notes/xxx/`。

## 新建文章的两种方式

**方式一：用命令（推荐）**

```bash
npm run new
```

它会依次问你标题、文件名、标签、摘要，然后自动生成一个带 frontmatter 的文件，并把 `draft` 设成 `true`（本地能看，线上不发布）。

**方式二：手动建文件**

在 `src/content/posts/` 下新建 `.md`，开头写上 frontmatter：

```yaml
---
title: 文章标题
description: 一句话摘要，会显示在列表页和搜索结果里
pubDate: 2026-09-23
tags: [Astro, 前端]
draft: false
pinned: false
---
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `pubDate` | 是 | 发布日期，决定排序 |
| `description` | 否 | 摘要，强烈建议写，影响 SEO 和搜索体验 |
| `tags` | 否 | 标签数组，会自动生成标签页 |
| `draft` | 否 | 为 `true` 时只在本地可见 |
| `pinned` | 否 | 为 `true` 时置顶在首页最前 |
| `updatedDate` | 否 | 更新日期，会显示在文章页 |

## 本地预览

```bash
npm run dev       # 开发模式，改完即时刷新，地址 http://localhost:4321
npm run build     # 生成静态站点到 dist/，同时建立搜索索引
npm run preview   # 预览构建结果（搜索功能只有这一步才能用）
```

> 搜索用的是 Pagefind，索引是在 `build` 阶段扫出来的。所以 `dev` 模式下搜索页会提示索引未生成，这是正常的。

## 可以改哪些地方

- **站点标题、作者、网址、评论配置** → `src/site.config.mjs`，全站唯一的配置入口
- **配色和排版** → `src/styles/global.css`，文件顶部的 CSS 变量就是全部主题色
- **首页** → `src/pages/index.astro`
- **关于页** → `src/pages/about.astro`
- **导航栏链接** → `src/components/Header.astro`

## 发布流程

写完文章后：

```bash
git add .
git commit -m "post: 文章标题"
git push
```

推上去之后 GitHub Actions 会自动构建并部署，大概一两分钟后线上就能看到。

把这篇删掉，就可以开始写你自己的东西了。
