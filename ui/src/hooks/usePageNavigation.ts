import { useCallback } from 'react';
import { pathForPage } from '../pages';
import { useStore } from '../store';
import type { Page } from '../types';

export function usePageNavigation() {
  const { dispatch } = useStore();

  return useCallback((page: Page, options?: { replace?: boolean }) => {
    const path = pathForPage(page);
    if (typeof window !== 'undefined') {
      const method = options?.replace ? 'replaceState' : 'pushState';
      if (window.location.pathname !== path || window.location.search || window.location.hash) {
        window.history[method]({ page }, '', path);
      }
      if (window.__hydrallmLenis) {
        window.__hydrallmLenis.scrollTo(0, { duration: 0.55 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    dispatch({ type: 'SET_PAGE', page });
  }, [dispatch]);
}
