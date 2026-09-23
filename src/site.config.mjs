/**
 * 全站配置 —— 这是唯一的「改配置」入口。
 * 站点标题、作者、网址、评论等都在这里改，改完所有页面自动生效。
 */

export const SITE = {
  // ─── 基本信息 ───────────────────────────────────────────────
  // 站点标题，显示在浏览器标签页和页面顶部
  title: '我的技术笔记',

  // 站点副标题，显示在首页大标题下面
  tagline: '记录、整理、输出',

  // 站点描述，用于 SEO 和社交分享
  description: '一个记录技术学习与思考的地方',

  // 显示在页脚和文章页的名字，改成你想用的称呼
  author: 'ktcb0922',

  // 页面语言
  lang: 'zh-CN',

  // ─── 网址（部署到 GitHub Pages 用）────────────────────────────
  // 你的 GitHub Pages 根域名，结尾不要斜杠
  url: 'https://ktcb0922.github.io',

  // 仓库名不是「用户名.github.io」时，这里必须写仓库名。
  // 仓库叫 boke，站点就挂在 https://ktcb0922.github.io/boke/
  base: '/boke/',

  // 首页显示的文章数
  postsPerPage: 10,

  // ─── 评论系统（giscus，基于 GitHub Discussions）──────────────
  // repoId / categoryId 去 https://giscus.app 生成后填进来，步骤见 README「开启评论」
  // 没填之前评论区会显示引导提示，不会报错
  giscus: {
    enabled: true,
    repo: 'ktcb0922/boke',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
  },

  // ─── 社交链接（不需要的留空字符串即可隐藏）────────────────────
  // GitHub 刻意留空：仓库是公开的，页脚放链接等于把访客引到源码页面
  social: {
    github: '',
    email: '',
  },

  // ─── 访客统计（GoatCounter）──────────────────────────────────
  // 隐私友好：不采集个人信息、不存 Cookie、不需要同意横幅。
  // 站点码 = GoatCounter 的 Account name，后台在 https://ktcb.goatcounter.com
  // 留空 = 完全不加载任何统计脚本。
  analytics: {
    goatcounter: 'ktcb',
  },
};

/**
 * 给站内路径加上 base 前缀。
 *
 * 站点部署在子路径（/boke/）下时，所有内部链接都必须过这个函数，
 * 否则部署后点任何链接都会 404。path 写成以 / 开头的站点绝对路径。
 *
 *   withBase('/posts/hello/')  →  '/boke/posts/hello/'
 */
export function withBase(path = '/') {
  const base = SITE.base.endsWith('/') ? SITE.base.slice(0, -1) : SITE.base;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** 生成带域名的完整地址，用于 RSS / robots.txt / canonical */
export function absoluteUrl(path = '/') {
  return new URL(withBase(path), SITE.url).href;
}

export default SITE;
