import { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Eye,
  MessageSquareText,
  MousePointer2,
  Play,
  Search,
  Square,
  TerminalSquare,
  Wrench,
  XCircle,
} from 'lucide-react';
import { useStore } from '../store';
import type { ModelCapability, ModelCapabilityResult, ModelTestResult, ModelTestStatus, ModelTestTarget } from '../types';
import { cn } from '../utils/cn';
import AnimatedGlyph from './AnimatedGlyph';
import { LoadingSpinner } from './Loading';

const capabilityMeta: Record<ModelCapability, { label: string; short: string; desc: string; icon: React.ReactNode }> = {
  text: { label: '文本请求', short: '文本', desc: '基础单轮对话，检查 200 OK 和非空 message.content', icon: <MessageSquareText size={16} /> },
  vision: { label: '图片请求', short: '图片', desc: '发送含数字图片，检查接口是否接受图片并给出文本回复', icon: <Eye size={16} /> },
  tool: { label: '工具调用', short: '工具', desc: '发送 tools schema，检查 finish_reason 和 tool_calls', icon: <Wrench size={16} /> },
};

const statusMeta: Record<ModelTestStatus, { label: string; className: string; icon: React.ReactNode }> = {
  passed: { label: '通过', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={14} /> },
  failed: { label: '失败', className: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle size={14} /> },
  uncertain: { label: '不确定', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertCircle size={14} /> },
  skipped: { label: '跳过', className: 'bg-slate-50 text-slate-500 border-slate-200', icon: <Circle size={14} /> },
};

function targetKey(target: Pick<ModelTestTarget, 'providerId' | 'modelName'>) {
  return `${target.providerId}::${target.modelName}`;
}

function resultKey(result: Pick<ModelTestResult, 'providerId' | 'modelName'>) {
  return `${result.providerId}::${result.modelName}`;
}

function mergeModelTestResults(current: ModelTestResult[], incoming: ModelTestResult[]) {
  const merged = new Map(current.map(result => [resultKey(result), result]));
  incoming.forEach(result => merged.set(resultKey(result), result));
  return Array.from(merged.values()).sort((a, b) => b.startedAt - a.startedAt);
}

function StatusPill({ status }: { status: ModelTestStatus }) {
  const meta = statusMeta[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium', meta.className)}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

function CapabilityCell({ result }: { result?: ModelCapabilityResult }) {
  if (!result) {
    return <span className="text-xs text-slate-400">未测试</span>;
  }

  return (
    <div className="min-w-0 space-y-1">
      <StatusPill status={result.status} />
      <p className="line-clamp-2 break-words text-xs text-slate-500">{result.detail}</p>
      {result.latencyMs !== undefined && (
        <p className="break-words font-mono text-[11px] text-slate-400">
          {result.latencyMs}ms
          {result.usage?.totalTokens ? ` · ${result.usage.totalTokens} tokens` : ''}
        </p>
      )}
    </div>
  );
}

export default function ModelTests() {
  const { state, runModelTests } = useStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [capabilities, setCapabilities] = useState<Set<ModelCapability>>(new Set(['text', 'vision', 'tool']));
  const [query, setQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<ModelTestResult[]>([]);
  const [progress, setProgress] = useState<{ total: number; completed: number; current: ModelTestTarget | null; stopped: boolean }>({
    total: 0,
    completed: 0,
    current: null,
    stopped: false,
  });
  const abortRef = useRef<AbortController | null>(null);
  const stopRequestedRef = useRef(false);

  const targets = useMemo<ModelTestTarget[]>(() => state.providers.flatMap(provider =>
    provider.models.map(modelName => ({
      id: targetKey({ providerId: provider.id, modelName }),
      providerId: provider.id,
      providerName: provider.name,
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey,
      apiKeys: provider.apiKeys || [],
      apiKeyMode: provider.apiKeyMode || 'single',
      modelName,
    }))
  ), [state.providers]);

  const filteredTargets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return targets;
    return targets.filter(target =>
      target.providerName.toLowerCase().includes(needle) ||
      target.modelName.toLowerCase().includes(needle) ||
      target.baseUrl.toLowerCase().includes(needle)
    );
  }, [query, targets]);

  const selectedTargets = targets.filter(target => selected.has(target.id));
  const selectedCapabilities = Array.from(capabilities);
  const resultMap = new Map(results.map(result => [resultKey(result), result]));
  const progressPercent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  const currentTargetKey = progress.current ? targetKey(progress.current) : '';

  const toggleTarget = (id: string) => {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCapability = (capability: ModelCapability) => {
    setCapabilities(current => {
      const next = new Set(current);
      if (next.has(capability)) next.delete(capability);
      else next.add(capability);
      return next;
    });
  };

  const selectVisible = () => {
    setSelected(current => {
      const next = new Set(current);
      filteredTargets.forEach(target => next.add(target.id));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const runTests = async () => {
    if (!selectedTargets.length || !selectedCapabilities.length) return;
    const queue = [...selectedTargets];
    const capabilitiesToRun = [...selectedCapabilities];
    setRunning(true);
    setError('');
    stopRequestedRef.current = false;
    setProgress({ total: queue.length, completed: 0, current: queue[0] || null, stopped: false });
    try {
      for (let index = 0; index < queue.length; index += 1) {
        if (stopRequestedRef.current) break;
        const target = queue[index];
        const controller = new AbortController();
        abortRef.current = controller;
        setProgress({ total: queue.length, completed: index, current: target, stopped: false });

        const nextResults = await runModelTests([target], capabilitiesToRun, controller.signal);
        setResults(current => mergeModelTestResults(current, nextResults));
        setProgress({ total: queue.length, completed: index + 1, current: queue[index + 1] || null, stopped: false });
      }
    } catch (err) {
      if (
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Error && err.name === 'AbortError')
      ) {
        setProgress(current => ({ ...current, current: null, stopped: true }));
        return;
      }
      setError(err instanceof Error ? err.message : '模型能力测试失败');
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  const stopTests = () => {
    stopRequestedRef.current = true;
    abortRef.current?.abort();
    setProgress(current => ({ ...current, current: null, stopped: true }));
    setRunning(false);
  };

  const summary = useMemo(() => {
    const counts: Record<ModelTestStatus, number> = { passed: 0, failed: 0, uncertain: 0, skipped: 0 };
    results.flatMap(result => result.results).forEach(result => {
      counts[result.status] += 1;
    });
    return counts;
  }, [results]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
            <AnimatedGlyph variant="lab" />
            Capability Lab
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">模型能力测试</h2>
          <p className="mt-1 text-slate-500">用极简请求探测文本、图片和工具调用三项能力，只判定是否支持。</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          onClick={runTests}
          disabled={running || !selectedTargets.length || !selectedCapabilities.length}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-cyan-200 transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {running ? <LoadingSpinner size="sm" /> : <Play size={16} />}
          开始测试 {selectedTargets.length ? `(${selectedTargets.length})` : ''}
        </button>
          {running && (
            <button
              type="button"
              onClick={stopTests}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 sm:w-auto"
            >
              <Square size={15} />
              终止测试
            </button>
          )}
        </div>
      </div>

      {(running || progress.total > 0) && (
        <div className="model-test-progress-card motion-card rounded-xl border border-cyan-200 bg-cyan-50/70 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
                {running ? <LoadingSpinner size="sm" /> : progress.stopped ? <Square size={14} /> : <CheckCircle2 size={15} />}
                <span>{running ? '逐个测试中' : progress.stopped ? '测试已终止' : '测试已完成'}</span>
                <span className="model-test-progress-count rounded-full bg-white/70 px-2 py-0.5 font-mono text-xs text-cyan-700">
                  {progress.completed} / {progress.total}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-cyan-700/80">
                {progress.current ? `当前模型：${progress.current.providerName} / ${progress.current.modelName}` : '当前没有正在运行的模型'}
              </p>
            </div>
            <div className="w-full md:w-72">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-700">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="model-test-progress-track mt-1 h-2 overflow-hidden rounded-full bg-white/70">
                <div
                  className="model-test-progress-fill h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-4">
          <div className="motion-card rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">测试项目</h3>
              <span className="text-xs text-slate-400">已选 {capabilities.size} 项</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(Object.keys(capabilityMeta) as ModelCapability[]).map(capability => {
                const active = capabilities.has(capability);
                return (
                  <button
                    key={capability}
                    onClick={() => toggleCapability(capability)}
                    className={cn(
                      'min-h-24 rounded-lg border p-3 text-left transition-all',
                      active ? 'border-cyan-300 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {capabilityMeta[capability].icon}
                        {capabilityMeta[capability].short}
                      </span>
                      {active ? <Check size={15} /> : <Square size={15} className="text-slate-300" />}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{capabilityMeta[capability].desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="motion-card rounded-xl border border-slate-200 bg-white p-4" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">选择模型</h3>
              <span className="text-xs text-slate-400">{selected.size} / {targets.length}</span>
            </div>
            <div className="relative mt-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="搜索提供商或模型"
              />
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <button onClick={selectVisible} className="text-cyan-700 hover:text-cyan-800">选择当前列表</button>
              <button onClick={clearSelection} className="text-slate-500 hover:text-slate-700">清空选择</button>
            </div>
            <div className="mt-3 max-h-[460px] space-y-2 overflow-y-auto pr-1">
              {filteredTargets.map((target, index) => {
                const active = selected.has(target.id);
                const key = targetKey(target);
                const isCurrent = currentTargetKey === key;
                const hasResult = resultMap.has(key);
                return (
                  <button
                    key={target.id}
                    onClick={() => toggleTarget(target.id)}
                    className={cn(
                      'model-test-target-option table-row-motion w-full rounded-lg border p-3 text-left transition-all',
                      isCurrent ? 'model-test-target-current border-cyan-500 bg-cyan-100 shadow-lg shadow-cyan-200/60' :
                      active ? 'model-test-target-active border-cyan-300 bg-cyan-50' : 'model-test-target-idle border-slate-200 bg-white hover:bg-slate-50'
                    )}
                    style={{ animationDelay: `${Math.min(index, 14) * 18}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        'model-test-target-check mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border',
                        active ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-300 text-transparent'
                      )}>
                        <Check size={13} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate font-mono text-sm text-slate-800">{target.modelName}</p>
                          {isCurrent && <span className="shrink-0 rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-medium text-white">测试中</span>}
                          {!isCurrent && hasResult && <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">已测</span>}
                        </div>
                        <p className="truncate text-xs text-slate-500">{target.providerName}</p>
                        <p className="truncate font-mono text-[11px] text-slate-400">{target.baseUrl}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {!filteredTargets.length && (
                <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center">
                  <TerminalSquare size={28} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">没有可测试的模型</p>
                  <p className="mt-1 text-xs text-slate-400">请先在模型提供商中添加或拉取模型</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="motion-card rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-emerald-700">通过</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">{summary.passed}</p>
            </div>
            <div className="motion-card rounded-xl border border-slate-200 bg-white p-4" style={{ animationDelay: '35ms' }}>
              <p className="text-xs text-red-700">失败</p>
              <p className="mt-1 text-2xl font-bold text-red-800">{summary.failed}</p>
            </div>
            <div className="motion-card rounded-xl border border-slate-200 bg-white p-4" style={{ animationDelay: '70ms' }}>
              <p className="text-xs text-amber-700">不确定</p>
              <p className="mt-1 text-2xl font-bold text-amber-800">{summary.uncertain}</p>
            </div>
            <div className="motion-card rounded-xl border border-slate-200 bg-white p-4" style={{ animationDelay: '105ms' }}>
              <p className="text-xs text-slate-500">测试模型</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{results.length}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="model-test-results-card motion-card min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white" style={{ animationDelay: '90ms' }}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-800">测试结果</h3>
                <p className="mt-0.5 text-xs text-slate-400">结果会按模型覆盖更新，最近测试排在前面。</p>
              </div>
              {running && (
                <span className="inline-flex items-center gap-2 text-sm text-cyan-700">
                  <LoadingSpinner size="sm" />
                  正在测试
                </span>
              )}
            </div>

            <div className="model-test-results-scroll max-w-full overflow-x-auto">
              <table className="model-test-results-table w-full min-w-[760px] table-fixed text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-[230px] px-5 py-3 font-medium">模型</th>
                    {(Object.keys(capabilityMeta) as ModelCapability[]).map(capability => (
                      <th key={capability} className="px-4 py-3 font-medium">{capabilityMeta[capability].label}</th>
                    ))}
                    <th className="w-[92px] px-4 py-3 font-medium">耗时</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map(result => {
                    const byCapability = new Map(result.results.map(item => [item.capability, item]));
                    return (
                      <tr key={`${result.providerId}-${result.modelName}`} className="table-row-motion align-top">
                        <td className="px-5 py-4">
                          <p className="break-all font-mono font-medium text-slate-800">{result.modelName}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{result.providerName}</p>
                          <p className="mt-1 break-all font-mono text-[11px] text-slate-400">{new Date(result.startedAt).toLocaleString()}</p>
                        </td>
                        {(Object.keys(capabilityMeta) as ModelCapability[]).map(capability => (
                          <td key={capability} className="px-4 py-4">
                            <CapabilityCell result={byCapability.get(capability)} />
                          </td>
                        ))}
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">{result.latencyMs}ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!results.length && (
              <div className="py-16 text-center">
                <MousePointer2 size={36} className="mx-auto text-slate-300" />
                <p className="mt-3 text-slate-500">选择一个或多个模型后开始测试</p>
                <p className="mt-1 text-xs text-slate-400">不会写入故障转移链，只会调用提供商中保存的模型配置。</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
