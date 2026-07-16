import { Activity, AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Gauge, Server, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../store';
import type { ChannelModelStats } from '../types';
import { cn } from '../utils/cn';
import AnimatedGlyph from './AnimatedGlyph';

type ModelStatsSortKey = 'name' | 'requests' | 'successes' | 'failures' | 'successRate' | 'updatedAt';
type ModelStatsSortDirection = 'asc' | 'desc';
type ModelStatsRow = ChannelModelStats['models'][string];

const sortLabels: Record<ModelStatsSortKey, string> = {
  name: '模型',
  requests: '总数',
  successes: '成功',
  failures: '失败',
  successRate: '成功率',
  updatedAt: '最近',
};

function pct(successes: number, total: number) {
  return total ? Number(((successes / total) * 100).toFixed(1)) : 100;
}

function compareModelStats(a: ModelStatsRow, b: ModelStatsRow, sortKey: ModelStatsSortKey, sortDirection: ModelStatsSortDirection) {
  const direction = sortDirection === 'asc' ? 1 : -1;

  if (sortKey === 'name') {
    return a.name.localeCompare(b.name) * direction;
  }

  const valueOf = (model: ModelStatsRow) => {
    if (sortKey === 'successRate') return pct(model.successes, model.requests);
    return Number(model[sortKey] || 0);
  };

  const diff = valueOf(a) - valueOf(b);
  if (diff !== 0) return diff * direction;
  return a.name.localeCompare(b.name);
}

function StatTile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: string }) {
  return (
    <div className="motion-card rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold', tone)}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  align = 'right',
  onSort,
}: {
  label: string;
  sortKey: ModelStatsSortKey;
  activeKey: ModelStatsSortKey;
  direction: ModelStatsSortDirection;
  align?: 'left' | 'right';
  onSort: (key: ModelStatsSortKey) => void;
}) {
  const active = activeKey === sortKey;
  const Icon = active ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className={cn('px-5 py-3 font-medium', align === 'left' ? 'text-left' : 'text-right')}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-slate-100 hover:text-slate-700',
          align === 'right' && 'ml-auto',
          active ? 'text-blue-700' : 'text-slate-500'
        )}
      >
        <span>{label}</span>
        <Icon size={12} aria-hidden="true" />
      </button>
    </th>
  );
}

function ChannelBlock({
  channel,
  index,
  sortKey,
  sortDirection,
  onSort,
}: {
  channel: ChannelModelStats;
  index: number;
  sortKey: ModelStatsSortKey;
  sortDirection: ModelStatsSortDirection;
  onSort: (key: ModelStatsSortKey) => void;
}) {
  const models = Object.values(channel.models || {}).sort((a, b) => compareModelStats(a, b, sortKey, sortDirection));
  const successRate = pct(channel.successes, channel.requests);

  return (
    <section className="model-stats-channel motion-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{ animationDelay: `${index * 45}ms` }}>
      <div className="model-stats-channel-header border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="model-stats-channel-icon inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Server size={16} />
              </span>
              <h3 className="truncate font-semibold text-slate-800">{channel.name}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">{models.length} 个模型</span>
            </div>
            {channel.baseUrl && <p className="mt-1 truncate font-mono text-xs text-slate-400">{channel.baseUrl}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2 text-right text-xs">
            <div className="model-stats-summary-pill rounded-lg bg-white px-3 py-2">
              <p className="text-slate-400">总请求</p>
              <p className="font-mono font-semibold text-slate-800">{channel.requests.toLocaleString()}</p>
            </div>
            <div className="model-stats-summary-pill model-stats-summary-success rounded-lg bg-emerald-50 px-3 py-2">
              <p className="text-emerald-500">成功</p>
              <p className="font-mono font-semibold text-emerald-700">{channel.successes.toLocaleString()}</p>
            </div>
            <div className="model-stats-summary-pill model-stats-summary-failure rounded-lg bg-red-50 px-3 py-2">
              <p className="text-red-500">失败</p>
              <p className="font-mono font-semibold text-red-700">{channel.failures.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="model-stats-progress-track mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full rounded-full transition-all duration-700', successRate >= 99 ? 'bg-emerald-500' : successRate >= 90 ? 'bg-amber-500' : 'bg-red-500')}
            style={{ width: `${Math.min(100, Math.max(0, successRate))}%` }}
          />
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="sticky top-0 z-10 bg-white text-xs text-slate-500 shadow-[0_1px_0_#e2e8f0]">
            <tr>
              <SortHeader label={sortLabels.name} sortKey="name" activeKey={sortKey} direction={sortDirection} align="left" onSort={onSort} />
              <SortHeader label={sortLabels.requests} sortKey="requests" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
              <SortHeader label={sortLabels.successes} sortKey="successes" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
              <SortHeader label={sortLabels.failures} sortKey="failures" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
              <SortHeader label={sortLabels.successRate} sortKey="successRate" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
              <SortHeader label={sortLabels.updatedAt} sortKey="updatedAt" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {models.map((model, rowIndex) => {
              const rate = pct(model.successes, model.requests);
              return (
                <tr key={model.name} className="table-row-motion hover:bg-blue-50/40" style={{ animationDelay: `${Math.min(rowIndex, 12) * 25}ms` }}>
                  <td className="max-w-[360px] px-5 py-3">
                    <div className="flex items-center gap-2">
                      {model.failures > 0 ? <AlertTriangle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                      <span className="truncate font-mono text-xs text-slate-700">{model.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-slate-700">{model.requests.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-emerald-600">{model.successes.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-red-500">{model.failures.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn('rounded-full px-2 py-1 font-mono text-xs', rate >= 99 ? 'bg-emerald-50 text-emerald-700' : rate >= 90 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700')}>
                      {rate}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {model.lastStatus ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs text-red-600">
                        <XCircle size={12} /> {model.lastStatus}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-600">
                        <CheckCircle2 size={12} /> OK
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!models.length && (
          <div className="py-12 text-center text-slate-400">
            <Gauge size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无模型统计</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ModelStats() {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<ModelStatsSortKey>('requests');
  const [sortDirection, setSortDirection] = useState<ModelStatsSortDirection>('desc');
  const stats = state.backendStats;
  const channels = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.values(stats?.channelModels || {})
      .filter((channel) => {
        if (!needle) return true;
        return channel.name.toLowerCase().includes(needle) ||
          channel.baseUrl.toLowerCase().includes(needle) ||
          Object.keys(channel.models || {}).some(model => model.toLowerCase().includes(needle));
      })
      .sort((a, b) => b.requests - a.requests || a.name.localeCompare(b.name));
  }, [stats?.channelModels, query]);
  const totalModels = channels.reduce((sum, channel) => sum + Object.keys(channel.models || {}).length, 0);

  const handleSort = (nextKey: ModelStatsSortKey) => {
    if (sortKey === nextKey) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === 'name' ? 'asc' : 'desc');
  };

  return (
    <div className="page-motion space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <AnimatedGlyph variant="stats" />
            Persistent Statistics
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">模型统计</h2>
          <p className="mt-1 text-slate-500">按渠道分块查看各模型的持久化成功、失败与总请求数。</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <select
            value={`${sortKey}:${sortDirection}`}
            onChange={event => {
              const [nextKey, nextDirection] = event.target.value.split(':') as [ModelStatsSortKey, ModelStatsSortDirection];
              setSortKey(nextKey);
              setSortDirection(nextDirection);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="requests:desc">总数从高到低</option>
            <option value="requests:asc">总数从低到高</option>
            <option value="successes:desc">成功从高到低</option>
            <option value="failures:desc">失败从高到低</option>
            <option value="successRate:desc">成功率从高到低</option>
            <option value="updatedAt:desc">最近更新优先</option>
            <option value="name:asc">模型名 A-Z</option>
          </select>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 xl:w-80"
            placeholder="搜索渠道、地址或模型"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatTile label="总请求数" value={(stats?.requests || 0).toLocaleString()} sub="持久化累计" tone="text-slate-800" />
        <StatTile label="故障转移" value={(stats?.failovers || 0).toLocaleString()} sub="成功转移次数" tone="text-amber-600" />
        <StatTile label="成功请求" value={(stats?.successes || 0).toLocaleString()} sub="最终成功响应" tone="text-emerald-600" />
        <StatTile label="统计模型" value={totalModels.toLocaleString()} sub={`${channels.length} 个渠道`} tone="text-blue-600" />
      </div>

      <div className="space-y-4">
        {channels.map((channel, index) => (
          <ChannelBlock
            key={channel.name}
            channel={channel}
            index={index}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        ))}
        {!channels.length && (
          <div className="motion-card rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <Activity size={36} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">暂无匹配的模型统计</p>
          </div>
        )}
      </div>
    </div>
  );
}
