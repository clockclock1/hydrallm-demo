import { useState } from 'react';
import { Clock3, Server } from 'lucide-react';
import { useStore } from '../store';
import type { ActiveThread } from '../types';
import { cn } from '../utils/cn';
import AnimatedGlyph from './AnimatedGlyph';

const phaseMeta: Record<string, { label: string; className: string }> = {
  starting: { label: '创建中', className: 'border-slate-200 bg-slate-50 text-slate-600' },
  calling: { label: '调用中', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  retrying: { label: '重试中', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  streaming: { label: '流式转发', className: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
  skipped: { label: '已跳过', className: 'border-slate-200 bg-slate-50 text-slate-600' },
  'failed-target': { label: '目标失败', className: 'border-red-200 bg-red-50 text-red-700' },
  completed: { label: '已响应', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  failed: { label: '失败', className: 'border-red-200 bg-red-50 text-red-700' },
  'release-wait': { label: '已响应', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
};

function elapsedText(startedAt: number, now: number) {
  if (!startedAt) return '0s';
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function formatBytes(value?: number) {
  const bytes = Number(value) || 0;
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

const memoryLabels: Record<string, string> = {
  pid: '进程 ID',
  workingSetBytes: '工作集',
  peakWorkingSetBytes: '峰值工作集',
  privateBytes: '私有内存',
  virtualBytes: '虚拟内存',
  dataBytes: '数据段',
};

function formatMemoryValue(key: string, value: unknown) {
  if (typeof value === 'number' && key.toLowerCase().includes('bytes')) {
    return formatBytes(value);
  }
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string') return value || '-';
  if (value === null || value === undefined) return '-';
  return JSON.stringify(value);
}

function PhasePill({ phase }: { phase: string }) {
  const meta = phaseMeta[phase] || { label: phase || '未知', className: 'border-slate-200 bg-slate-50 text-slate-600' };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium', meta.className)}>
      {meta.label}
    </span>
  );
}

function ThreadCard({ thread, now, index }: { thread: ActiveThread; now: number; index: number }) {
  const targetLabel = thread.targetModel || thread.targetName || thread.targetBaseUrl || '等待目标';

  return (
    <div className="motion-card rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md" style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <AnimatedGlyph variant="threads" className="text-blue-600" />
            </span>
            <h3 className="truncate font-semibold text-slate-800">{thread.chainName}</h3>
            <PhasePill phase={thread.phase} />
            <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs text-slate-500">
              #{thread.slot || thread.id}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{thread.status}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={13} />
            {elapsedText(thread.startedAt, now)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">请求模型</p>
          <p className="mt-1 truncate font-mono text-sm text-slate-700">{thread.requestedModel || '-'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">正在尝试</p>
          <p className="mt-1 truncate font-mono text-sm text-blue-700">{targetLabel}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">尝试次数</p>
          <p className="mt-1 font-mono text-sm text-slate-700">
            {thread.attempt || 0}{thread.maxAttempts ? ` / ${thread.maxAttempts}` : ''}
          </p>
        </div>
      </div>

      {(thread.targetName || thread.targetBaseUrl || thread.failedModels.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {thread.targetName && <span className="rounded-md bg-slate-100 px-2 py-1">{thread.targetName}</span>}
          {thread.targetBaseUrl && <span className="rounded-md bg-slate-100 px-2 py-1 font-mono">{thread.targetBaseUrl}</span>}
          {thread.failedModels.map(model => (
            <span key={model} className="rounded-md bg-red-50 px-2 py-1 font-mono text-red-600">{model}</span>
          ))}
        </div>
      )}

      {thread.attemptErrors.length > 0 && (
        <div className="live-attempt-errors mt-4 rounded-lg border border-red-100 bg-red-50/60 p-3">
          <p className="text-xs font-semibold text-red-700">转移原因</p>
          <div className="mt-2 space-y-2">
            {thread.attemptErrors.map((item, attemptIndex) => (
              <div key={`${item.target}-${item.attempt || 0}-${attemptIndex}`} className="live-attempt-error-item rounded-md bg-white px-3 py-2 text-xs text-red-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-semibold">{item.target || 'target'}</span>
                  {item.attempt !== undefined && <span className="text-red-400">#{item.attempt}</span>}
                  {item.status ? <span className="live-attempt-status rounded bg-red-100 px-1.5 py-0.5 font-mono">{item.status}</span> : null}
                </div>
                <p className="mt-1 break-words text-red-600">{item.message}</p>
                {item.detail && item.detail !== item.message && (
                  <p className="mt-1 line-clamp-2 break-words font-mono text-[11px] text-red-400">{item.detail}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveStatus() {
  const { state } = useStore();
  const [memoryExpanded, setMemoryExpanded] = useState(false);
  const now = Date.now();
  const threads = state.activeThreads;
  const activeChains = new Set(threads.map(thread => thread.chainName)).size;
  const memory = state.backendStats?.memory;
  const memoryEntries = Object.entries(memory || {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <AnimatedGlyph variant="activity" />
            Live Threads
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">实时状况</h2>
          <p className="mt-1 text-slate-500">查看代理 API 当前创建的线程、正在尝试的目标模型和进程内存占用。</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 self-start rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 xl:self-auto">
          <AnimatedGlyph variant="refresh" />
          自动刷新
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="motion-card rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">活动线程</span>
            <AnimatedGlyph variant="threads" className="text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{threads.length}</p>
        </div>
        <div className="motion-card rounded-xl border border-slate-200 bg-white p-4" style={{ animationDelay: '45ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">涉及链路</span>
            <AnimatedGlyph variant="chains" className="text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{activeChains}</p>
        </div>
        <button
          type="button"
          onClick={() => setMemoryExpanded(expanded => !expanded)}
          aria-expanded={memoryExpanded}
          className="motion-card cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          style={{ animationDelay: '90ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">内存占用</span>
            <AnimatedGlyph variant="memory" className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{formatBytes(memory?.workingSetBytes)}</p>
        </button>
        <div
          className={cn(
            'live-memory-panel md:col-span-3',
            memoryExpanded && 'live-memory-panel-open'
          )}
          aria-hidden={!memoryExpanded}
        >
          <div className="live-memory-panel-inner">
            <div className="motion-card rounded-xl border border-slate-200 bg-white p-4" style={{ animationDelay: '115ms' }}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {memoryEntries.map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">{memoryLabels[key] || key}</p>
                    <p className="mt-1 break-words font-mono text-sm font-semibold text-slate-700">
                      {formatMemoryValue(key, value)}
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-slate-400">{key}</p>
                  </div>
                ))}
                {!memoryEntries.length && (
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                    暂无内存数据
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn('live-status-thread-area space-y-3', memoryExpanded && 'live-status-thread-area-memory-open')}>
        {threads.map((thread, index) => (
          <ThreadCard key={thread.id} thread={thread} now={now} index={index} />
        ))}
        {!threads.length && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <Server size={36} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">当前没有活动线程</p>
          </div>
        )}
      </div>
    </div>
  );
}
