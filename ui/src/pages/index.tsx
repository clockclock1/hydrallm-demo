import type { ComponentType } from 'react';
import type { Page } from '../types';
import DashboardPage from './DashboardPage';
import ProvidersPage from './ProvidersPage';
import ModelTestsPage from './ModelTestsPage';
import FailoverChainsPage from './FailoverChainsPage';
import ModelStatsPage from './ModelStatsPage';
import ProxyEndpointsPage from './ProxyEndpointsPage';
import LiveStatusPage from './LiveStatusPage';
import LogsPage from './LogsPage';

export const pageComponents: Record<Page, ComponentType> = {
  dashboard: DashboardPage,
  providers: ProvidersPage,
  'model-tests': ModelTestsPage,
  chains: FailoverChainsPage,
  'model-stats': ModelStatsPage,
  endpoints: ProxyEndpointsPage,
  'live-status': LiveStatusPage,
  logs: LogsPage,
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
