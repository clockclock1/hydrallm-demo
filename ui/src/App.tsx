import { Suspense, useEffect, useRef, useState, type RefObject } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { StoreProvider, useStore } from './store';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import LoadingOverlay, { LoadingSpinner } from './components/Loading';
import { isKnownAppPath, pageComponents, pageFromPathname, pathForPage } from './pages';

type ThemeMode = 'dark' | 'light';

function initialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('hydrallm-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function PageContent() {
  const { state } = useStore();
  const PageComponent = pageComponents[state.currentPage] || pageComponents.dashboard;

  return (
    <div key={state.currentPage} className="page-motion">
      <Suspense key={state.currentPage} fallback={<PageLoading />}>
        <div className={state.pageStatsLoading ? 'hidden' : undefined}>
          <PageComponent key={state.currentPage} />
        </div>
        {state.pageStatsLoading && <PageLoading label="正在加载状态..." />}
      </Suspense>
    </div>
  );
}

function PageLoading({ label = '正在加载页面...' }: { label?: string }) {
  return (
    <div className="flex min-h-72 items-center justify-center text-sm text-slate-500">
      <div className="flex flex-col items-center gap-5">
        <LoadingSpinner size="md" className="text-cyan-400" />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}

function hasNestedScrollableParent(node: HTMLElement, wrapper: HTMLElement) {
  let current: HTMLElement | null = node;
  while (current && current !== wrapper) {
    if (current.hasAttribute('data-lenis-prevent')) return true;

    const style = window.getComputedStyle(current);
    const canScrollY =
      /(auto|scroll|overlay)/.test(style.overflowY) &&
      current.scrollHeight > current.clientHeight + 1;
    const canScrollX =
      /(auto|scroll|overlay)/.test(style.overflowX) &&
      current.scrollWidth > current.clientWidth + 1;

    if (canScrollY || canScrollX) return true;
    current = current.parentElement;
  }
  return false;
}

const nestedScrollSelector = [
  '.overflow-auto',
  '.overflow-y-auto',
  '.overflow-x-auto',
  '.uiverse-model-picker-list',
  '.model-test-results-scroll',
  '[data-lenis-prevent]',
].join(',');

function getScrollableAxes(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const y =
    /(auto|scroll|overlay)/.test(style.overflowY) &&
    element.scrollHeight > element.clientHeight + 1;
  const x =
    /(auto|scroll|overlay)/.test(style.overflowX) &&
    element.scrollWidth > element.clientWidth + 1;
  if (!x && !y) return null;
  return { x, y };
}

function useNestedLenisScroll(
  enabled: boolean,
  rootRef: RefObject<HTMLElement | null>,
  mainWrapperRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!enabled) return undefined;
    const root = rootRef.current;
    const mainWrapper = mainWrapperRef.current;
    if (!root || !mainWrapper) return undefined;

    const entries = new Map<HTMLElement, { lenis: Lenis; observer: ResizeObserver }>();
    const timers: number[] = [];
    let refreshFrame = 0;

    const destroyEntry = (element: HTMLElement) => {
      const entry = entries.get(element);
      if (!entry) return;
      entry.observer.disconnect();
      entry.lenis.destroy();
      delete element.dataset.lenisScroll;
      entries.delete(element);
    };

    const updateNestedCount = () => {
      window.__hydrallmNestedLenisCount = entries.size;
    };

    const refresh = () => {
      refreshFrame = 0;
      const active = new Set<HTMLElement>();

      root.querySelectorAll<HTMLElement>(nestedScrollSelector).forEach((element) => {
        if (element === root || element === mainWrapper) return;
        const axes = getScrollableAxes(element);
        if (!axes) return;

        active.add(element);
        if (entries.has(element)) return;

        const orientation = axes.x && !axes.y ? 'horizontal' : 'vertical';
        const gestureOrientation = axes.x && axes.y ? 'both' : orientation;
        const lenis = new Lenis({
          wrapper: element,
          content: element,
          eventsTarget: element,
          orientation,
          gestureOrientation,
          smoothWheel: true,
          syncTouch: true,
          lerp: 0.16,
          duration: 0.62,
          easing: t => 1 - Math.pow(1 - t, 4),
          wheelMultiplier: 1.16,
          touchMultiplier: 1.18,
          autoRaf: false,
          allowNestedScroll: true,
          prevent: node => {
            const target = node as HTMLElement;
            return target !== element && hasNestedScrollableParent(target, element);
          },
        });
        const observer = new ResizeObserver(() => lenis.resize());
        observer.observe(element);
        element.dataset.lenisScroll = 'nested';
        entries.set(element, { lenis, observer });
      });

      entries.forEach((_, element) => {
        if (!element.isConnected || !root.contains(element) || !active.has(element) || !getScrollableAxes(element)) {
          destroyEntry(element);
        }
      });
      updateNestedCount();
    };

    const scheduleRefresh = () => {
      if (refreshFrame) return;
      refreshFrame = window.requestAnimationFrame(refresh);
    };

    const tick = (time: number) => {
      entries.forEach(({ lenis }) => lenis.raf(time * 1000));
    };

    gsap.ticker.add(tick);
    const mutationObserver = new MutationObserver(scheduleRefresh);
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-lenis-prevent'],
    });

    const rootObserver = new ResizeObserver(scheduleRefresh);
    rootObserver.observe(root);

    refresh();
    timers.push(window.setTimeout(refresh, 250));
    timers.push(window.setTimeout(refresh, 900));

    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
      mutationObserver.disconnect();
      rootObserver.disconnect();
      gsap.ticker.remove(tick);
      entries.forEach((_, element) => destroyEntry(element));
      delete window.__hydrallmNestedLenisCount;
    };
  }, [enabled, rootRef, mainWrapperRef]);
}

function useLenisScroll(enabled: boolean) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return undefined;

    const lenis = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      smoothWheel: true,
      syncTouch: true,
      lerp: 0.14,
      duration: 0.78,
      easing: t => 1 - Math.pow(1 - t, 4),
      wheelMultiplier: 1.22,
      touchMultiplier: 1.28,
      autoRaf: false,
      allowNestedScroll: true,
      prevent: node => hasNestedScrollableParent(node as HTMLElement, wrapper),
    });

    window.__hydrallmLenis = lenis;
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const observer = new ResizeObserver(() => lenis.resize());
    observer.observe(content);

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      if (window.__hydrallmLenis === lenis) {
        delete window.__hydrallmLenis;
      }
      lenis.destroy();
    };
  }, [enabled]);

  return { wrapperRef, contentRef };
}

function AppLayout() {
  const { state, dispatch } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const { wrapperRef, contentRef } = useLenisScroll(state.authChecked && state.authenticated);
  useNestedLenisScroll(state.authChecked && state.authenticated, contentRef, wrapperRef);

  useEffect(() => {
    window.localStorage.setItem('hydrallm-theme', theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const syncRoute = () => {
      const page = pageFromPathname(window.location.pathname);
      dispatch({ type: 'SET_PAGE', page });
      if (!isKnownAppPath(window.location.pathname)) {
        window.history.replaceState({ page }, '', pathForPage(page));
      }
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, [dispatch]);

  const busyLabel =
    state.saveStatus === 'loading' ? '正在加载...' :
    state.saveStatus === 'saving' ? '正在保存...' :
    '';
  const showBusyOverlay = Boolean(busyLabel);

  if (!state.authChecked) {
    return (
      <div data-theme={theme} className="uiverse-login flex min-h-dvh items-center justify-center bg-slate-950 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="md" className="text-blue-400" />
          <span>正在检查登录状态...</span>
        </div>
      </div>
    );
  }

  if (!state.authenticated) {
    return <Login theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <div data-theme={theme} className="uiverse-shell min-h-dvh bg-slate-100 md:flex md:h-screen md:overflow-hidden">
      <LoadingOverlay show={showBusyOverlay} label={busyLabel} />
      <div className="hidden md:block">
        <Sidebar theme={theme} onToggleTheme={toggleTheme} />
      </div>

      <header className="uiverse-topbar sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
          aria-label="打开菜单"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-bold text-slate-900">Failover Proxy</p>
          <p className="truncate text-[11px] text-slate-500">模型故障转移代理</p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="uiverse-theme-toggle flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
          aria-label={theme === 'dark' ? '切换亮色模式' : '切换暗色模式'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="关闭菜单"
          />
          <div className="pointer-events-none relative h-full">
            <div className="pointer-events-auto">
              <Sidebar mobile onNavigate={() => setMobileMenuOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="pointer-events-auto absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              aria-label="关闭菜单"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <main ref={wrapperRef} className="min-h-0 flex-1 overflow-y-auto">
        <div ref={contentRef} className="mx-auto max-w-7xl p-3 pb-8 transition-all duration-300 sm:p-4 md:p-6 lg:p-8">
          <PageContent />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
}
