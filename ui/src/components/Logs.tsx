import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Filter,
  Save,
  ScrollText,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import type { LogEntry, LogSettings } from '../types';
import { cn } from '../utils/cn';

const defaultLogSettings: LogSettings = {
  maxEntries: 500,
  maxBytes: 10 * 1024 * 1024,
  maxErrorChars: 65536,
};
const errorPreviewLimit = 180;

function bytesToMb(bytes: number) {
  return Math.max(1, Math.round((Number(bytes) || defaultLogSettings.maxBytes) / 1024 / 1024));
}

function modelErrorFor(log: LogEntry, model: string) {
  return (log.failedModelErrors || []).find(item => item.model === model && item.error);
}

function logErrorDetails(log: LogEntry) {
  const modelErrors = (log.failedModelErrors || [])
    .filter(item => item.model || item.error)
    .map(item => `${item.model || 'target'}:\n${item.error || 'unknown error'}`)
    .join('\n\n');
  if (modelErrors && log.error && !modelErrors.includes(log.error)) {
    return `${modelErrors}\n\n${log.error}`;
  }
  return modelErrors || log.error || '';
}

function errorPreview(error: string) {
  const firstLine = error
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean) || 'unknown error';
  const preview = firstLine.replace(/\s+/g, ' ');
  return preview.length > errorPreviewLimit ? `${preview.slice(0, errorPreviewLimit - 1)}...` : preview;
}

function combinedErrorPreview(log: LogEntry, fullError: string) {
  const modelPreviews = (log.failedModelErrors || [])
    .filter(item => item.model || item.error)
    .map(item => errorPreview(item.error || `${item.model || 'target'}: unknown error`));
  if (modelPreviews.length > 0) {
    const preview = modelPreviews.join(', ');
    return preview.length > errorPreviewLimit ? `${preview.slice(0, errorPreviewLimit - 1)}...` : preview;
  }
  return errorPreview(fullError);
}

export default function Logs() {
  const { state, saveLogSettings, clearLogs } = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [filterChain, setFilterChain] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<{ title: string; message: string } | null>(null);
  const [settingsDraft, setSettingsDraft] = useState({
    maxEntries: defaultLogSettings.maxEntries,
    maxBytesMb: bytesToMb(defaultLogSettings.maxBytes),
    maxErrorChars: defaultLogSettings.maxErrorChars,
  });
  const [settingsStatus, setSettingsStatus] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);

  const logSettings = state.backendStats?.logSettings || state.backendConfig?.logSettings || defaultLogSettings;

  useEffect(() => {
    setSettingsDraft({
      maxEntries: logSettings.maxEntries || defaultLogSettings.maxEntries,
      maxBytesMb: bytesToMb(logSettings.maxBytes || defaultLogSettings.maxBytes),
      maxErrorChars: logSettings.maxErrorChars || defaultLogSettings.maxErrorChars,
    });
  }, [logSettings.maxEntries, logSettings.maxBytes, logSettings.maxErrorChars]);

  const filteredLogs = useMemo(() => state.logs.filter(log => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (filterChain !== 'all' && log.chainName !== filterChain) return false;
    return true;
  }), [state.logs, filterStatus, filterChain]);

  const chainNames = useMemo(() => [...new Set(state.logs.map(log => log.chainName).filter(Boolean))], [state.logs]);
  const failoverLogs = state.logs.filter(log => log.failedModels.length > 0);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsStatus('');
    try {
      await saveLogSettings({
        maxEntries: Math.max(1, Math.floor(Number(settingsDraft.maxEntries) || defaultLogSettings.maxEntries)),
        maxBytes: Math.max(1, Math.floor(Number(settingsDraft.maxBytesMb) || bytesToMb(defaultLogSettings.maxBytes))) * 1024 * 1024,
        maxErrorChars: Math.max(256, Math.floor(Number(settingsDraft.maxErrorChars) || defaultLogSettings.maxErrorChars)),
      });
      setSettingsStatus('日志设置已保存');
    } catch (err) {
      setSettingsStatus(err instanceof Error ? err.message : '日志设置保存失败');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('确定要清理所有请求日志吗？CSV 文件也会被清空。')) return;
    setClearingLogs(true);
    setSettingsStatus('');
    try {
      await clearLogs();
      setSettingsStatus('请求日志已清理');
    } catch (err) {
      setSettingsStatus(err instanceof Error ? err.message : '清理日志失败');
    } finally {
      setClearingLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">请求日志</h2>
          <p className="mt-1 text-slate-500">查看代理请求记录，日志独立保存到 CSV 文件。</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
          <p className="font-mono">日志：{state.backendStats?.logsPath || '-'}</p>
          <p className="mt-1 font-mono">模型统计：{state.backendStats?.modelStatsPath || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="motion-card rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">总日志</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{state.logs.length}</p>
        </div>
        <div className="motion-card rounded-xl border border-slate-200 bg-white px-4 py-3" style={{ animationDelay: '35ms' }}>
          <p className="text-xs text-slate-500">成功请求</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">{state.logs.filter(log => log.status === 'success').length}</p>
        </div>
        <div className="motion-card rounded-xl border border-slate-200 bg-white px-4 py-3" style={{ animationDelay: '70ms' }}>
          <p className="text-xs text-slate-500">失败请求</p>
          <p className="mt-1 text-xl font-bold text-red-500">{state.logs.filter(log => log.status === 'failed').length}</p>
        </div>
        <div className="motion-card rounded-xl border border-slate-200 bg-white px-4 py-3" style={{ animationDelay: '105ms' }}>
          <p className="text-xs text-slate-500">触发转移</p>
          <p className="mt-1 text-xl font-bold text-amber-600">{failoverLogs.length}</p>
        </div>
      </div>

      <div className="motion-card rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto_auto] lg:items-end">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">限制日志数量</span>
            <input
              type="number"
              min={1}
              max={100000}
              value={settingsDraft.maxEntries}
              onChange={event => setSettingsDraft(current => ({ ...current, maxEntries: Number(event.target.value) }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">限制 CSV 大小（MB）</span>
            <input
              type="number"
              min={1}
              max={1024}
              value={settingsDraft.maxBytesMb}
              onChange={event => setSettingsDraft(current => ({ ...current, maxBytesMb: Number(event.target.value) }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">单条错误最大字符数</span>
            <input
              type="number"
              min={256}
              max={1048576}
              value={settingsDraft.maxErrorChars}
              onChange={event => setSettingsDraft(current => ({ ...current, maxErrorChars: Number(event.target.value) }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="log-action-button inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            <Save className="log-action-icon" size={16} aria-hidden="true" />
            <span>保存设置</span>
          </button>
          <button
            type="button"
            onClick={handleClearLogs}
            disabled={clearingLogs}
            className="log-action-button inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="log-action-icon" size={16} aria-hidden="true" />
            <span>清理日志</span>
          </button>
        </div>
        {settingsStatus && <p className="mt-3 text-xs text-slate-500">{settingsStatus}</p>}
      </div>

      <div className="motion-card flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-sm text-slate-600">筛选：</span>
        </div>
        <select
          value={filterStatus}
          onChange={event => setFilterStatus(event.target.value as 'all' | 'success' | 'failed')}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">所有状态</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
        </select>
        <select
          value={filterChain}
          onChange={event => setFilterChain(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">所有转移链</option>
          {chainNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-400">
          显示 {filteredLogs.length} / {state.logs.length} 条
        </span>
      </div>

      <div className="motion-card overflow-hidden rounded-xl border border-slate-200 bg-white">
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
              <tr className="bg-slate-50 text-xs text-slate-500">
                <th className="px-5 py-3 text-left font-medium">时间</th>
                <th className="px-5 py-3 text-left font-medium">转移链</th>
                <th className="px-5 py-3 text-left font-medium">请求模型</th>
                <th className="px-5 py-3 text-left font-medium">调用路径</th>
                <th className="whitespace-nowrap px-5 py-3 text-left font-medium">状态</th>
                <th className="px-5 py-3 text-left font-medium">延迟</th>
                <th className="px-5 py-3 text-left font-medium">错误信息</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log, index) => {
                const time = new Date(log.timestamp);
                const dateStr = time.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
                const timeStr = time.toLocaleTimeString('zh-CN');
                const hasFailover = log.failedModels.length > 0;
                const fullError = logErrorDetails(log);
                return (
                  <tr
                    key={log.id}
                    className={cn('table-row-motion transition-colors hover:bg-slate-50', log.status === 'failed' && 'bg-red-50/30')}
                    style={{ animationDelay: `${Math.min(index, 16) * 20}ms` }}
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-500">
                      <span className="text-slate-400">{dateStr}</span> {timeStr}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <span className="block truncate whitespace-nowrap" title={log.chainName}>{log.chainName}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex max-w-full items-center rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600" title={log.originalModel}>
                        <span className="block truncate whitespace-nowrap">{log.originalModel}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        {log.failedModels.map((model, idx) => {
                          const modelError = modelErrorFor(log, model);
                          return (
                            <button
                              key={`${model}-${idx}`}
                              type="button"
                              onClick={() => modelError && setSelectedError({ title: `${log.chainName} / ${model}`, message: modelError.error })}
                              className={cn(
                                'inline-flex max-w-full rounded bg-red-50 px-1.5 py-0.5 font-mono text-[11px] leading-5 text-red-500 line-through',
                                modelError && 'cursor-pointer hover:bg-red-100 hover:text-red-600',
                              )}
                              title={modelError?.error || model}
                            >
                              <span className="break-all">{model}</span>
                            </button>
                          );
                        })}
                        {hasFailover && <ArrowRight size={10} className="shrink-0 text-slate-300" />}
                        <span className={cn('inline-flex max-w-full break-all rounded px-1.5 py-0.5 font-mono text-[11px] leading-5', log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500')}>
                          {log.finalModel || '全部失败'}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-emerald-600">
                          <CheckCircle2 size={12} /> 成功
                          {hasFailover && <AlertTriangle size={10} className="ml-1 text-amber-500" />}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-red-500">
                          <XCircle size={12} /> 失败
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      <span className={cn(log.latency < 1000 ? 'text-emerald-600' : log.latency < 3000 ? 'text-amber-600' : 'text-red-500')}>
                        {log.latency >= 1000 ? `${(log.latency / 1000).toFixed(1)}s` : `${log.latency}ms`}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {fullError ? (
                        <button
                          type="button"
                          onClick={() => setSelectedError({ title: `${log.chainName} / ${log.originalModel}`, message: fullError })}
                          className="log-error-preview block w-full min-w-0 text-left text-blue-600 hover:text-blue-700 hover:underline"
                          title="点击查看完整错误"
                        >
                          {combinedErrorPreview(log, fullError)}
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
