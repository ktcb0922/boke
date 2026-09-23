# 技术笔记博客

基于 [Astro](https://astro.build) 的静态博客，托管在 GitHub Pages。
全站无后端，写 Markdown 就是写文章。

**特性**

- 极快的静态页面，零 JS 框架运行时（只有主题切换和搜索用了一点点原生 JS）
- 明暗双主题，代码块高亮跟着一起切换，无闪白
- 文章目录自动生成 + 滚动高亮
- 标签、归档、上下篇导航、RSS
- giscus 评论（基于 GitHub Discussions，免费无广告）
- Pagefind 站内全文搜索（构建时生成索引，不需要服务端）
- 推送即自动部署

---

## 一、本地跑起来

**环境要求：Node.js 22.12 或更高版本**（注意 Astro 不支持 23 这类奇数版本）。在终端里执行：

```bash
node -v         # 确认 >= 22.12
npm install     # 安装依赖（第一次需要，大约 1 分钟）
npm run dev     # 启动开发服务器 → http://localhost:4321
```

> 想先看效果又不想装依赖？直接用浏览器打开根目录的 `design-preview.html`，
> 它引用了项目真实的样式文件，可以看到首页和文章页长什么样，右上角能切换明暗主题。
> 这个文件只是设计样张，随时可以删掉。

其他命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 开发模式，改文件即时刷新 |
| `npm run build` | 构建静态站点到 `dist/`，同时生成搜索索引（会先自动跑一次自检） |
| `npm run preview` | 预览构建结果（**搜索功能只有这一步能测**） |
| `npm run new` | 交互式新建一篇文章 |
| `npm run check` | 构建前自检：脚本语法 + 站内链接前缀（不依赖 node_modules，随时可跑） |

---

## 二、配置在哪

全站配置只有一个入口：**`src/site.config.mjs`**。现在已经按你的信息填好了：

```js
export const SITE = {
  title: '我的技术笔记',                      // 站点标题，随便改
  tagline: '记录、整理、输出',                 // 首页副标题
  description: '一个记录技术学习与思考的地方',  // 站点描述（SEO 用）
  author: 'ktcb0922',                        // 页脚显示的名字，建议改成你想用的称呼
  url: 'https://ktcb0922.github.io',          // GitHub Pages 根域名
  base: '/boke/',                             // 部署子路径 = 仓库名
  // ...
};
```

`astro.config.mjs` 会自动读取 `url` 和 `base`，不用重复改。

> ⚠️ **`base` 不要随手改。** 仓库叫 `boke`，站点就挂在 `/boke/` 下，
> 所以所有站内链接都必须用 `withBase()` 包一层（见第六节）。
> 如果以后你把仓库改名成 `ktcb0922.github.io`，把 `base` 改回 `'/'` 就行。

---

## 三、部署到 GitHub Pages

### 1. 建仓库（需要你自己点一下）

我没有你 GitHub 账号的权限，这一步得你来。打开 https://github.com/new ，填：

- **Repository name**：`boke`
- **Public**（私有仓库的 Pages 需要付费账号才能对外访问）
- **不要**勾选 Add a README / .gitignore / license —— 保持空仓库

点 **Create repository** 即可。

### 2. 配好 git 身份和认证

git 身份**已经配好了**（`ktcb0922 <1526638881@qq.com>`）。想改成别的称呼：

```bash
git config --global user.name "你的名字"
```

**还差认证** —— 机器上目前没有任何 GitHub 认证凭据，二选一：

**方式 A：SSH 密钥（推荐，一次配好长期有效）**

```bash
ssh-keygen -t ed25519 -C "1526638881@qq.com"    # 一路回车
pbcopy < ~/.ssh/id_ed25519.pub                  # 公钥复制到剪贴板
```

打开 https://github.com/settings/keys → **New SSH key** → 粘贴 → **Add SSH key**。

**方式 B：HTTPS + Personal Access Token**

打开 https://github.com/settings/tokens → **Generate new token (classic)** →
勾选 **repo** 权限 → 生成后**立刻复制**（只显示一次）。
推送时用户名填 `ktcb0922`，密码填这个 token。

### 3. 推送代码

仓库已初始化、**首次提交已完成**（`620faaf init: 博客初始化`，33 个文件），
现在只差关联远程仓库并推送：

```bash
cd ~/Desktop/ktcb/学习/博客
git remote add origin git@github.com:ktcb0922/boke.git
git push -u origin main
```

> 用方式 B 的话，把 remote 那行换成
> `git remote add origin https://github.com/ktcb0922/boke.git`

> 前提是第 1 步的 `boke` 仓库已经建好了，否则推送会报 `Repository not found`。

### 4. 开启 GitHub Pages

推完去仓库 **Settings → Pages**，把 **Source** 选成 **GitHub Actions**。

接着在 **Actions** 标签页能看到 `Deploy to GitHub Pages` 正在跑。等它跑完（约 1–2 分钟），访问：

**https://ktcb0922.github.io/boke/**

之后每次 `git push`，都会自动重新构建部署。

---

## 四、开启评论（giscus）

评论区在你填好配置前会显示一段提示，不会报错。配置步骤：

1. **让仓库支持 Discussions**：仓库 **Settings → General → Features**，勾上 **Discussions**
2. 去 [giscus.app](https://giscus.app)，按提示：
   - 填入仓库名 `ktcb0922/boke`
   - 它会检查通过后，在下面生成一段配置代码
   - 从中找到 **`data-repo-id`** 和 **`data-category-id`** 两个值
3. 把这两个值填进 `src/site.config.mjs`：

```js
giscus: {
  enabled: true,
  repo: 'ktcb0922/boke',
  repoId: '上面拿到的 data-repo-id',
  category: 'Announcements',
  categoryId: '上面拿到的 data-category-id',
},
```

4. 提交推送，评论框就出来了。

> giscus 需要安装它的 GitHub App 到你的账号，第一次访问评论区时按提示点一下授权即可。

---

## 五、日常写作

```bash
npm run new        # 交互式创建，会问标题、文件名、标签、摘要
```

或者直接在 `src/content/posts/` 里建 `.md` 文件，开头写 frontmatter：

```yaml
---
title: 文章标题
description: 一句话摘要，会出现在列表页和搜索结果里
pubDate: 2026-09-23
tags: [Astro, 前端]
draft: false      # true 则只在本地可见
pinned: false     # true 则置顶首页
---
```

写完后：

```bash
git add .
git commit -m "post: 文章标题"
git push
```

---

## 六、想改样式 / 结构

| 想改什么 | 改哪里 |
| --- | --- |
| 配色、字体、间距 | `src/styles/global.css`（顶部 CSS 变量就是全部主题色） |
| 站点信息、导航、评论 | `src/site.config.mjs` |
| 导航栏链接 | `src/components/Header.astro` |
| 首页布局 | `src/pages/index.astro` |
| 关于页 | `src/pages/about.astro` |
| 文章页（目录、上下篇） | `src/pages/posts/[...slug].astro` |

---

## 七、常见问题

**搜索没结果？**
搜索索引在 `npm run build` 时生成。开发模式（`npm run dev`）下没有索引，用 `npm run preview` 测试。

**部署后样式全丢 / 链接 404？**
大概率是仓库名不是 `用户名.github.io`，导致资源路径少了前缀。需要配置 `base`。

**评论框显示"配置尚未完成"？**
`repoId` / `categoryId` 还没填，见上面第四节。

**代码块在深色主题下还是浅色底？**
检查 `astro.config.mjs` 里 `shikiConfig.defaultColor` 是否被改掉了 —— 这个值必须保持 `false`，
否则 Shiki 会内联一个高优先级的颜色，主题就切不动了。

**页面里中英文之间的空格消失了？**
检查 `astro.config.mjs` 里的 `compressHTML`。Astro 7 默认是 `'jsx'`（会吃掉元素间的空格），
这个项目显式设成了 `true` 来保留空格，删掉这行会让中英混排粘在一起。

---

## 技术栈

| 组件 | 用途 |
| --- | --- |
| Astro 7 | 静态站点生成 |
| Shiki | 代码高亮（双主题） |
| Pagefind | 构建时全文搜索索引 |
| giscus | 评论（GitHub Discussions） |
| @astrojs/sitemap | 自动生成 sitemap.xml |
| GitHub Actions + Pages | 自动构建与托管 |

SEO 相关的文件都是自动生成的，不用手写：`sitemap-index.xml` 来自 sitemap 集成，
`robots.txt` 和 `rss.xml` 由 `src/pages/` 下的端点按 `site.config.mjs` 里的网址生成。
换域名后这些会自动跟着变，但记得重新部署一次。

