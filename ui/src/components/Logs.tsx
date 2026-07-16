import {
  ScrollText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,

  AlertTriangle,
  X,
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils/cn';
import { useState } from 'react';

export default function Logs() {
  const { state } = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [filterChain, setFilterChain] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<{ title: string; message: string } | null>(null);

  const filteredLogs = state.logs.filter(log => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (filterChain !== 'all' && log.chainName !== filterChain) return false;
    return true;
  });

  const chainNames = [...new Set(state.logs.map(l => l.chainName))];
  const failoverLogs = state.logs.filter(l => l.failedModels.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">请求日志</h2>
        <p className="text-slate-500 mt-1">查看所有通过故障转移代理的请求记录</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="motion-card bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">总日志</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{state.logs.length}</p>
        </div>
        <div className="motion-card bg-white rounded-xl border border-slate-200 px-4 py-3" style={{ animationDelay: '35ms' }}>
          <p className="text-xs text-slate-500">成功请求</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{state.logs.filter(l => l.status === 'success').length}</p>
        </div>
        <div className="motion-card bg-white rounded-xl border border-slate-200 px-4 py-3" style={{ animationDelay: '70ms' }}>
          <p className="text-xs text-slate-500">失败请求</p>
          <p className="text-xl font-bold text-red-500 mt-1">{state.logs.filter(l => l.status === 'failed').length}</p>
        </div>
        <div className="motion-card bg-white rounded-xl border border-slate-200 px-4 py-3" style={{ animationDelay: '105ms' }}>
          <p className="text-xs text-slate-500">触发转移</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{failoverLogs.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="motion-card bg-white rounded-xl border border-slate-200 px-5 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-sm text-slate-600">筛选：</span>
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | 'success' | 'failed')}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
        >
          <option value="all">所有状态</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
        </select>
        <select
          value={filterChain}
          onChange={e => setFilterChain(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
        >
          <option value="all">所有转移链</option>
          {chainNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          显示 {filteredLogs.length} / {state.logs.length} 条
        </span>
      </div>

      {/* Log Table */}
      <div className="motion-card bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1160px] table-fixed text-sm">
            <colgroup>
              <col className="w-[135px]" />
              <col className="w-[130px]" />
              <col className="w-[150px]" />
              <col className="w-[330px]" />
              <col className="w-[90px]" />
              <col className="w-[75px]" />
              <col className="w-[250px]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left px-5 py-3 font-medium">时间</th>
                <th className="text-left px-5 py-3 font-medium">转移链</th>
                <th className="text-left px-5 py-3 font-medium">请求模型</th>
                <th className="text-left px-5 py-3 font-medium">调用路径</th>
                <th className="text-left px-5 py-3 font-medium">状态</th>
                <th className="text-left px-5 py-3 font-medium">延迟</th>
                <th className="text-left px-5 py-3 font-medium">错误信息</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log, index) => {
                const time = new Date(log.timestamp);
                const dateStr = time.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
                const timeStr = time.toLocaleTimeString('zh-CN');
                const hasFailover = log.failedModels.length > 0;
                return (
                  <tr key={log.id} className={cn(
                    'table-row-motion hover:bg-slate-50 transition-colors',
                    log.status === 'failed' && 'bg-red-50/30'
                  )} style={{ animationDelay: `${Math.min(index, 16) * 20}ms` }}>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      <span className="text-slate-400">{dateStr}</span> {timeStr}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <span className="block truncate whitespace-nowrap" title={log.chainName}>{log.chainName}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex max-w-full items-center rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600"
                        title={log.originalModel}
                      >
                        <span className="block truncate whitespace-nowrap">{log.originalModel}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        {log.failedModels.map((m, i) => (
                          <span
                            key={i}
                            className="inline-flex max-w-full rounded bg-red-50 px-1.5 py-0.5 font-mono text-[11px] leading-5 text-red-500 line-through"
                            title={m}
                          >
                            <span className="break-all">{m}</span>
                          </span>
                        ))}
                        {hasFailover && <ArrowRight size={10} className="shrink-0 text-slate-300" />}
                        <span className={cn(
                          'inline-flex max-w-full break-all rounded px-1.5 py-0.5 font-mono text-[11px] leading-5',
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        )}>
                          {log.finalModel || '全部失败'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 size={12} /> 成功
                          {hasFailover && <AlertTriangle size={10} className="text-amber-500 ml-1" />}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500">
                          <XCircle size={12} /> 失败
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      <span className={cn(
                        log.latency < 1000 ? 'text-emerald-600' :
                        log.latency < 3000 ? 'text-amber-600' : 'text-red-500'
                      )}>
                        {log.latency >= 1000 ? (log.latency / 1000).toFixed(1) + 's' : log.latency + 'ms'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {log.error ? (
                        <button
                          type="button"
                          onClick={() => setSelectedError({
                            title: `${log.chainName} / ${log.originalModel}`,
                            message: log.error || '',
                          })}
                          className="log-error-preview block w-full min-w-0 text-left text-blue-600 hover:text-blue-700 hover:underline"
                          title="查看完整错误"
                        >
                          {log.error}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <ScrollText size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无匹配的日志</p>
            </div>
          )}
        </div>
      </div>

      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4" onClick={() => setSelectedError(null)}>
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-800">完整错误信息</h3>
                <p className="mt-0.5 text-xs text-slate-400">{selectedError.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedError(null)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[65dvh] overflow-auto p-3 sm:p-5">
              <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                {selectedError.message}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
