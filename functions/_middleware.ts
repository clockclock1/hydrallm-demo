/**
 * Cloudflare Pages Function - SPA fallback for /ui/* routes
 *
 * 上游 HydraLLM React UI 使用浏览器路由（history.pushState），每个页面有独立 URL：
 *   /ui/dashboard, /ui/providers, /ui/chains 等
 *
 * 当 Cloudflare Pages 收到 /ui/dashboard 等直接访问时，
 * 由于 dist/ui/ 目录下没有对应文件，会返回 404。
 *
 * 此中间件拦截所有 /ui/* 请求（排除 /ui/index.html 本身），
 * 将其 rewrite 到 /ui/index.html，让 React 接管路由。
 *
 * 注意：仅在文件不存在时 rewrite，避免死循环。
 */

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);

  // 只处理 /ui/* 路径
  if (!url.pathname.startsWith('/ui/')) {
    return context.next();
  }

  // 已是 /ui/index.html 直接放行
  if (url.pathname === '/ui/index.html') {
    return context.next();
  }

  // 构建 rewrite URL
  url.pathname = '/ui/index.html';

  // 创建新的请求并设置原始 URL 用于 Cloudflare Pages Assets 查找
  const rewriteRequest = new Request(url.toString(), context.request);

  try {
    const response = await context.env.ASSETS.fetch(rewriteRequest);

    // 如果 ASSETS 返回 404，说明文件确实不存在，执行 rewrite
    if (response.status === 404) {
      const indexUrl = new URL(context.request.url);
      indexUrl.pathname = '/ui/index.html';
      return new Response(
        await (
          await context.env.ASSETS.fetch(
            new Request(indexUrl.toString(), context.request)
          )
        ).text(),
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );
    }

    return response;
  } catch {
    // ASSETS.fetch 出错时 fallback
    const indexUrl = new URL(context.request.url);
    indexUrl.pathname = '/ui/index.html';
    return context.env.ASSETS.fetch(
      new Request(indexUrl.toString(), context.request)
    );
  }
};