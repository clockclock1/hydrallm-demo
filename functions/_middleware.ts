/**
 * Cloudflare Pages Function - SPA fallback for HydraLLM UI routes
 *
 * 上游 React UI 使用浏览器路由（history.pushState），8 个管理页面路径：
 * /ui/dashboard, /ui/providers, /ui/model-tests, /ui/chains,
 * /ui/model-stats, /ui/endpoints, /ui/live-status, /ui/logs
 *
 * CF Pages Git 集成没有默认 SPA fallback（不像 Vercel/Netlify），
 * 直接访问 /ui/<page> 返回 404。
 *
 * 解决方案：302 重定向到 /ui/#/<page>，利用 URL fragment 不触发页面刷新的特性。
 * React App.tsx 从 window.location.pathname（= /ui）读取并处理路由，
 * 所以页面内容正确，只是 URL 显示为 /ui/#/dashboard 等形式。
 */

interface Env {}

const KNOWN_APP_PATHS = new Set([
  '/dashboard',
  '/providers',
  '/model-tests',
  '/chains',
  '/model-stats',
  '/endpoints',
  '/live-status',
  '/logs',
]);

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 只处理 /ui/* 路径
  if (!path.startsWith('/ui/')) {
    return context.next();
  }

  // 提取 /ui/ 后面的路径部分，如 '/dashboard'
  const uiPath = path.slice(4); // 去掉 '/ui' 前缀

  // 只有 8 个已知管理页面路径才做 hash 重定向
  // 其他路径（/ui/assets/*, /ui/favicon.svg, /ui/index.html）放行
  if (!KNOWN_APP_PATHS.has(uiPath)) {
    return context.next();
  }

  // /ui/dashboard → /ui/#/dashboard
  url.pathname = '/ui';
  url.hash = uiPath;

  return Response.redirect(url.toString(), 302);
};