// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/site.config.mjs';

export default defineConfig({
  // 站点根域名，供 canonical / sitemap / RSS 使用
  site: SITE.url,

  // 部署子路径。仓库叫 boke，站点就挂在 /boke/ 下；
  // 如果以后把仓库改名为 用户名.github.io，这里改回 '/' 即可
  base: SITE.base,

  integrations: [sitemap()],

  // Astro 7 默认值是 'jsx'，会吃掉元素之间的空格，
  // 中英混排（例如「在 src/content/posts/ 里」）会粘在一起，所以显式设回 true
  compressHTML: true,

  markdown: {
    // Shiki 代码高亮：明暗两套主题，跟随页面主题切换
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // 关掉默认内联颜色，交给 global.css 用 CSS 变量控制，才能跟随主题
      defaultColor: false,
      wrap: true,
    },
  },

  devToolbar: {
    enabled: false,
  },
});
