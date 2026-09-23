---
title: 用 Shiki 双主题实现跟随切换的代码高亮
description: 博客要支持明暗两套主题，代码块的颜色也得跟着换。记录一下 Astro + Shiki 的具体做法和踩到的坑。
pubDate: 2026-09-20
tags: [Astro, 前端, 踩坑]
draft: false
---

这是一篇示例技术笔记，用来展示排版效果。你可以直接改成自己的内容，或者删掉。

## 问题是什么

博客支持明暗主题切换之后，正文颜色会跟着变，但代码块不会 —— 因为 Shiki 在构建时就把颜色内联成了十六进制值，写死在 HTML 里了。

浅色主题下看着正常的 `#24292e`，切到深色背景上就糊成一片。

## 两种解法

### 解法一：只用一套深色代码主题

最简单，但浅色主题下深色代码块会显得很突兀，像贴了张黑纸。

### 解法二：双主题 + CSS 变量（推荐）

Shiki 支持同时输出两套主题，把颜色写成 CSS 变量而不是字面量。这是 Astro 里的配置：

```js
// astro.config.mjs
export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // 关键：关掉默认内联颜色，否则变量不会生效
      defaultColor: false,
      wrap: true,
    },
  },
});
```

`defaultColor: false` 是最容易漏的一步。开着它的话，Shiki 会额外塞一个 `style="color:..."`，优先级比 CSS 类高，主题就切不动了。

然后 CSS 里按主题取值：

```css
.astro-code,
.astro-code span {
  color: var(--shiki-light);
  background-color: var(--shiki-light-bg);
}

[data-theme='dark'] .astro-code,
[data-theme='dark'] .astro-code span {
  color: var(--shiki-dark);
  background-color: var(--shiki-dark-bg);
}
```

注意 `background-color` 也要一起切，否则深色模式下代码块底色还是白的。

## 主题切换本身要防闪白

如果等 JS 加载完再设主题，页面会先亮一下再变暗。解决办法是把判断逻辑内联到 `<head>` 里，在首次绘制前就把 `data-theme` 写好：

```html
<script is:inline>
  (function () {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = stored || (prefersDark ? 'dark' : 'light');
  })();
</script>
```

`is:inline` 不能省 —— Astro 默认会把脚本抽出来打包成模块，那样就变成延迟执行，闪白又回来了。

## 小结

| 步骤 | 关键点 |
| --- | --- |
| 配置 Shiki | `themes` 传两个主题，`defaultColor: false` |
| 写 CSS | 前景色和背景色都要按主题切换 |
| 防闪白 | 主题判断脚本必须内联在 `<head>` |

整体思路就是把「颜色」从构建期决定推迟到运行期，交给 CSS 变量和 `data-theme` 属性去控制。这个模式在很多地方都能用上，不只是代码高亮。
