/**
 * Cloudflare Pages Function - 处理 /ui/* SPA 路由
 *
 * 上游 HydraLLM React UI 使用浏览器路由（history.pushState）。
 * 当直接访问 /ui/dashboard、/ui/providers 等路径时，CF Pages 会返回 404，
 * 此中间件将这些路径重定向到 /ui/index.html，让 React 接管路由。
 */

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 只处理 /ui/* 路径，且不是 index.html 本身
  if (!path.startsWith('/ui/') || path === '/ui/index.html') {
    return context.next();
  }

  // 重写 URL 到 /ui/index.html
  url.pathname = '/ui/index.html';
  return Response.redirect(url.toString(), 302);
};