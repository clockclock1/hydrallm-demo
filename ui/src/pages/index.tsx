import { lazy, type ComponentType } from 'react';
import type { Page } from '../types';

export const pageComponents: Record<Page, ComponentType> = {
  dashboard: lazy(() => import('./DashboardPage')),
  providers: lazy(() => import('./ProvidersPage')),
  'model-tests': lazy(() => import('./ModelTestsPage')),
  chains: lazy(() => import('./FailoverChainsPage')),
  'model-stats': lazy(() => import('./ModelStatsPage')),
  endpoints: lazy(() => import('./ProxyEndpointsPage')),
  'live-status': lazy(() => import('./LiveStatusPage')),
  logs: lazy(() => import('./LogsPage')),
};

export const pagePaths: Record<Page, string> = {
  dashboard: '/dashboard',
  providers: '/providers',
  'model-tests': '/model-tests',
  chains: '/chains',
  'model-stats': '/model-stats',
  endpoints: '/endpoints',
  'live-status': '/live-status',
  logs: '/logs',
};

const pageIds = Object.keys(pagePaths) as Page[];

function normalizePath(pathname: string) {
  const clean = pathname.replace(/\/+$/, '');
  return clean || '/';
}

export function pathForPage(page: Page) {
  return pagePaths[page] || pagePaths.dashboard;
}

export function pageFromPathname(pathname: string): Page {
  const clean = normalizePath(pathname);
  if (clean === '/' || clean === '/index.html') return 'dashboard';
  return pageIds.find(page => pagePaths[page] === clean) || 'dashboard';
}

export function isKnownAppPath(pathname: string) {
  const clean = normalizePath(pathname);
  return clean === '/' || clean === '/index.html' || pageIds.some(page => pagePaths[page] === clean);
}
