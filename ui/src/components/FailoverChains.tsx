import { useEffect, useRef, useState } from 'react';
import {
  Plus,
  X,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Layers,
  ArrowRight,
  Gauge,
  Timer,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store';
import type { FailoverChain, FailoverModel } from '../types';
import { cn } from '../utils/cn';

const strategyLabels: Record<FailoverChain['strategy'], { label: string; desc: string; icon: React.ReactNode }> = {
  'priority': { label: '优先级', desc: '按优先级顺序依次尝试', icon: <Layers size={14} /> },
  'round-robin': { label: '轮询', desc: '循环使用各模型', icon: <Shuffle size={14} /> },
  'weighted': { label: '优先级', desc: '按优先级顺序依次尝试', icon: <Layers size={14} /> },
  'latency-based': { label: '最低延迟', desc: '优先使用延迟最低的模型', icon: <Gauge size={14} /> },
};

const visibleStrategies: FailoverChain['strategy'][] = ['priority', 'round-robin', 'latency-based'];

function normalizeQueue(items: FailoverModel[]) {
  return [...items]
    .sort((a, b) => a.priority - b.priority)
    .map(normalizeQueueItem);
}

function renumberQueue(items: FailoverModel[]) {
  return items.map(normalizeQueueItem);
}

function normalizeQueueItem(model: FailoverModel, index: number) {
  return {
    ...model,
    priority: index + 1,
    timeout: Math.max(1, Number(model.timeout) || 30),
    maxRetries: Math.max(0, Number(model.maxRetries) || 0),
    weight: 1,
    enabled: model.enabled !== false,
  };
}

function modelQueueKey(model: FailoverModel) {
  return `${model.providerId}:${model.modelName}`;
}

function ChainEditor({
  chain,
  onSave,
  onClose,
}: {
  chain?: FailoverChain;
  onSave: (c: FailoverChain) => void;
  onClose: () => void;
}) {
  const { state } = useStore();
  const [name, setName] = useState(chain?.name || '');
  const [description, setDescription] = useState(chain?.description || '');
  const [strategy, setStrategy] = useState<FailoverChain['strategy']>(chain?.strategy === 'weighted' ? 'priority' : chain?.strategy || 'priority');
  const [proxyModelName, setProxyModelName] = useState(chain?.proxyModelName || '');
  const [proxyApiKey, setProxyApiKey] = useState(chain?.proxyApiKey || 'fpk-' + uuidv4().slice(0, 24));
  const [targetTimeoutSeconds, setTargetTimeoutSeconds] = useState(chain?.targetTimeoutSeconds || chain?.models?.[0]?.timeout || 30);
  const [targetMaxRetries, setTargetMaxRetries] = useState(chain?.targetMaxRetries ?? chain?.models?.[0]?.maxRetries ?? 0);
  const [circuitFailureThreshold, setCircuitFailureThreshold] = useState(chain?.circuitFailureThreshold || 3);
  const [circuitCooldownMinutes, setCircuitCooldownMinutes] = useState(chain?.circuitCooldownMinutes || 10);
  const [models, setModels] = useState<FailoverModel[]>(() => normalizeQueue(chain?.models || []));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const queueRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const dragPointerRef = useRef<number | null>(null);

  const addModel = (providerId: string, modelName: string) => {
    if (models.find(m => m.providerId === providerId && m.modelName === modelName)) return;
    setModels(current => renumberQueue([...normalizeQueue(current), {
      providerId,
      modelName,
      priority: current.length + 1,
      weight: 1,
      maxRetries: 2,
      timeout: 30,
      enabled: true,
    }]));
  };

  const removeModel = (idx: number) => {
    setModels(current => renumberQueue(normalizeQueue(current).filter((_, i) => i !== idx)));
  };

  const reorderModel = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setModels(current => {
      const next = normalizeQueue(current);
      if (fromIndex < 0 || fromIndex >= next.length || toIndex < 0 || toIndex >= next.length) return next;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return renumberQueue(next);
    });
  };

  const resetDragState = () => {
    dragPointerRef.current = null;
    draggedIndexRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const findPointerTargetIndex = (clientY: number) => {
    const items = Array.from(queueRef.current?.querySelectorAll<HTMLElement>('[data-queue-index]') || []);
    if (!items.length) return null;

    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    items.forEach((item) => {
      const index = Number(item.dataset.queueIndex);
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(clientY - (rect.top + rect.height / 2));
      if (distance < closestDistance) {
        closest = index;
        closestDistance = distance;
      }
    });
    return closest;
  };

  const handleDragStart = (event: React.PointerEvent, idx: number) => {
    event.preventDefault();
    dragPointerRef.current = event.pointerId;
    draggedIndexRef.current = idx;
    setDraggedIndex(idx);
    setDragOverIndex(idx);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveModel = (idx: number, direction: -1 | 1) => {
    reorderModel(idx, idx + direction);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (dragPointerRef.current !== event.pointerId || draggedIndexRef.current === null) return;
      event.preventDefault();
      const targetIndex = findPointerTargetIndex(event.clientY);
      if (targetIndex === null) return;
      setDragOverIndex(targetIndex);
      if (targetIndex !== draggedIndexRef.current) {
        reorderModel(draggedIndexRef.current, targetIndex);
        draggedIndexRef.current = targetIndex;
        setDraggedIndex(targetIndex);
      }
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (dragPointerRef.current === event.pointerId) resetDragState();
    };

    window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: false });
    window.addEventListener('pointerup', handlePointerEnd, true);
    window.addEventListener('pointercancel', handlePointerEnd, true);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerEnd, true);
      window.removeEventListener('pointercancel', handlePointerEnd, true);
    };
  }, []);

  const updateModel = (idx: number, updates: Partial<FailoverModel>) => {
    setModels(current => renumberQueue(normalizeQueue(current).map((m, i) => i === idx ? { ...m, ...updates } : m)));
  };

  const handleSave = () => {
    const timeout = Math.max(1, Math.min(3600, Math.floor(Number(targetTimeoutSeconds) || 30)));
    const maxRetries = Math.max(0, Math.min(20, Math.floor(Number(targetMaxRetries) || 0)));
    const failureThreshold = Math.max(1, Math.min(100, Math.floor(Number(circuitFailureThreshold) || 3)));
    const cooldownMinutes = Math.max(1, Math.min(1440, Math.floor(Number(circuitCooldownMinutes) || 10)));
    const nextModels = normalizeQueue(models).map(model => ({
      ...model,
      timeout,
      maxRetries,
    }));
    if (!name || !proxyModelName || nextModels.length === 0) return;
    onSave({
      id: chain?.id || uuidv4(),
      name,
      description,
      strategy,
      proxyModelName,
      proxyApiKey,
      targetTimeoutSeconds: timeout,
      targetMaxRetries: maxRetries,
      circuitFailureThreshold: failureThreshold,
      circuitCooldownMinutes: cooldownMinutes,
      models: nextModels,
      enabled: chain?.enabled ?? true,
      createdAt: chain?.createdAt || Date.now(),
      totalRequests: chain?.totalRequests || 0,
      failoverCount: chain?.failoverCount || 0,
      successRate: chain?.successRate || 100,
    });
  };

  const orderedModels = normalizeQueue(models);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-2 pt-4 sm:p-4 sm:pt-6" onClick={onClose}>
      <div className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-slate-800">{chain ? '编辑故障转移链' : '创建故障转移链'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">链名称</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                placeholder="GPT-4 高可用"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">代理模型名称</label>
              <input
                value={proxyModelName}
                onChange={e => setProxyModelName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono transition-all"
                placeholder="my-gpt4-ha"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
              placeholder="故障转移链的描述..."
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">代理 API Key</label>
            <div className="flex gap-2">
              <input
                value={proxyApiKey}
                onChange={e => setProxyApiKey(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono transition-all"
              />
              <button
                onClick={() => setProxyApiKey('fpk-' + uuidv4().slice(0, 24))}
                className="px-3 py-2.5 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                重新生成
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">链路队列设置</h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">只应用到当前故障转移链的目标请求。</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Timer size={12} /> 超时(秒)
                </span>
                <input
                  type="number"
                  min={1}
                  max={3600}
                  value={targetTimeoutSeconds}
                  onChange={event => setTargetTimeoutSeconds(Math.max(1, Math.min(3600, Number(event.target.value) || 30)))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                  <RotateCcw size={12} /> 最大重试
                </span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={targetMaxRetries}
                  onChange={event => setTargetMaxRetries(Math.max(0, Math.min(20, Number(event.target.value) || 0)))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ShieldAlert size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">链路熔断保护</h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">只应用到当前故障转移链，避免持续命中不可用上游。</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">连续失败次数</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={circuitFailureThreshold}
                  onChange={event => setCircuitFailureThreshold(Math.max(1, Math.min(100, Number(event.target.value) || 3)))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">禁用分钟数</span>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={circuitCooldownMinutes}
                  onChange={event => setCircuitCooldownMinutes(Math.max(1, Math.min(1440, Number(event.target.value) || 10)))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
            </div>
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">故障转移策略</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {visibleStrategies.map(s => (
                <button
                  key={s}
                  onClick={() => setStrategy(s)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-all',
                    strategy === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {strategyLabels[s].icon}
                  <span className="font-medium text-xs">{strategyLabels[s].label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{strategyLabels[strategy].desc}</p>
          </div>

          {/* Add Model */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">添加模型到转移链</label>
            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
              {state.providers.map(provider => (
                <div key={provider.id}>
                  <p className="text-xs text-slate-500 mb-1 font-medium">{provider.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.models.map(model => {
                      const isAdded = orderedModels.some(m => m.providerId === provider.id && m.modelName === model);
                      return (
                        <button
                          key={model}
                          onClick={() => addModel(provider.id, model)}
                          disabled={isAdded}
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-md border transition-all',
                            isAdded
                              ? 'bg-blue-50 border-blue-200 text-blue-400 cursor-not-allowed'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                          )}
                        >
                          {isAdded ? '✓ ' : '+ '}{model}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Chain */}
          {orderedModels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                转移链配置 ({orderedModels.length} 个模型)
              </label>
              <div ref={queueRef} className="space-y-2">
                {orderedModels.map((model, idx) => {
                  const provider = state.providers.find(p => p.id === model.providerId);
                  return (
                    <div
                      key={modelQueueKey(model)}
                      data-queue-index={idx}
                      className={cn(
                        'border rounded-lg p-3 transition-all select-none',
                        model.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60',
                        draggedIndex === idx && 'scale-[0.99] opacity-50',
                        dragOverIndex === idx && draggedIndex !== idx && 'border-blue-300 bg-blue-50/40 shadow-sm'
                      )}
                    >
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start mb-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <button
                            type="button"
                            onPointerDown={event => handleDragStart(event, idx)}
                            onPointerUp={resetDragState}
                            onPointerCancel={resetDragState}
                            className="queue-icon-button inline-flex h-7 w-7 touch-none flex-shrink-0 cursor-grab items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:cursor-grabbing"
                            title="拖动调整顺序"
                            aria-label={`调整 ${model.modelName} 的顺序`}
                          >
                            <span className="fallback-icon" aria-hidden="true">::</span>
                          </button>
                          <span className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                            idx === 0 ? 'bg-blue-100 text-blue-600' :
                            idx === 1 ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-500'
                          )}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate break-all text-sm font-mono font-medium text-slate-700">{model.modelName}</span>
                            <span className="text-xs text-slate-400 ml-2">{provider?.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => moveModel(idx, -1)}
                            disabled={idx === 0}
                            className="queue-icon-button inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title="上移"
                            aria-label={`上移 ${model.modelName}`}
                          >
                            <span className="fallback-icon" aria-hidden="true">^</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveModel(idx, 1)}
                            disabled={idx === orderedModels.length - 1}
                            className="queue-icon-button inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title="下移"
                            aria-label={`下移 ${model.modelName}`}
                          >
                            <span className="fallback-icon" aria-hidden="true">v</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateModel(idx, { enabled: !model.enabled })}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium shadow-sm transition-colors',
                              model.enabled
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                            )}
                            title={model.enabled ? '点击禁用模型' : '点击启用模型'}
                          >
                            <span className="button-content-layer">
                              <span className="fallback-icon" aria-hidden="true">{model.enabled ? 'ON' : 'X'}</span>
                              {model.enabled ? '已启用' : '已禁用'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeModel(idx)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-100"
                            title="删除模型"
                          >
                            <span className="button-content-layer">
                              <span className="fallback-icon" aria-hidden="true">X</span>
                              删除
                            </span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !proxyModelName || orderedModels.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FailoverChains() {
  const { state, dispatch } = useStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingChain, setEditingChain] = useState<FailoverChain | undefined>();
  const [expandedChain, setExpandedChain] = useState<string | null>(null);

  const handleSave = (c: FailoverChain) => {
    if (editingChain) {
      dispatch({ type: 'UPDATE_CHAIN', chain: c });
    } else {
      dispatch({ type: 'ADD_CHAIN', chain: c });
    }
    setShowEditor(false);
    setEditingChain(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">故障转移链</h2>
          <p className="text-slate-500 mt-1">配置模型故障转移策略和路由规则</p>
        </div>
        <button
          onClick={() => { setEditingChain(undefined); setShowEditor(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm shadow-blue-200"
        >
          <Plus size={16} />
          创建转移链
        </button>
      </div>

      {/* Chains */}
      <div className="space-y-4">
        {state.chains.map((chain, index) => {
          const isExpanded = expandedChain === chain.id;
          return (
            <div key={chain.id} className={cn(
              'motion-card bg-white rounded-xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md',
              chain.enabled ? 'border-slate-200' : 'border-slate-200 opacity-70'
            )} style={{ animationDelay: `${Math.min(index, 14) * 35}ms` }}>
              {/* Header */}
              <div
                className="px-4 py-4 sm:px-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpandedChain(isExpanded ? null : chain.id)}
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    chain.enabled ? 'bg-gradient-to-br from-blue-50 to-violet-50' : 'bg-slate-100'
                  )}>
                    <GitBranch size={20} className={chain.enabled ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate font-semibold text-slate-800">{chain.name}</h4>
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                        chain.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      )}>
                        {chain.enabled ? '已启用' : '已禁用'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                        {strategyLabels[chain.strategy].label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-400 mt-0.5">{chain.description}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
                    <div className="text-center">
                      <p className="font-semibold text-slate-700">{chain.totalRequests.toLocaleString()}</p>
                      <p>请求</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-amber-600">{chain.failoverCount}</p>
                      <p>转移</p>
                    </div>
                    <div className="text-center">
                      <p className={cn('font-semibold', chain.successRate >= 99 ? 'text-emerald-600' : 'text-amber-600')}>
                        {chain.successRate}%
                      </p>
                      <p>成功率</p>
                    </div>
                  </div>

                  {/* Quick flow */}
                  <div className="hidden lg:flex items-center gap-1">
                    {chain.models.slice(0, 3).map((m, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {m.modelName.length > 12 ? m.modelName.slice(0, 12) + '…' : m.modelName}
                        </span>
                        {i < Math.min(chain.models.length, 3) - 1 && <ArrowRight size={10} className="text-slate-300" />}
                      </div>
                    ))}
                    {chain.models.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{chain.models.length - 3}</span>
                    )}
                  </div>

                  {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-slate-100">
                  {/* Proxy Info */}
                  <div className="chain-config-strip px-4 py-3 sm:px-5 bg-gradient-to-r from-blue-50/50 to-violet-50/50 flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">代理模型：</span>
                      <code className="chain-config-pill bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-600 font-mono text-xs">{chain.proxyModelName}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">API Key：</span>
                      <code className="chain-config-pill bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-mono text-xs">{chain.proxyApiKey.slice(0, 12)}...</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(chain.proxyApiKey)}
                        className="chain-config-copy text-slate-400 hover:text-blue-600 transition-colors"
                        title="复制"
                      >
                        <span className="fallback-icon" aria-hidden="true">C</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">队列：</span>
                      <code className="chain-config-pill bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-mono text-xs">
                        T:{chain.targetTimeoutSeconds || chain.models[0]?.timeout || 30}s / R:{chain.targetMaxRetries ?? chain.models[0]?.maxRetries ?? 0}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">熔断：</span>
                      <code className="chain-config-pill bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-mono text-xs">
                        F:{chain.circuitFailureThreshold || 3} / C:{chain.circuitCooldownMinutes || 10}m
                      </code>
                    </div>
                  </div>

                  {/* Visual Flow Diagram */}
                  <div className="px-4 py-4 sm:px-5">
                    <p className="text-xs font-medium text-slate-500 mb-3">故障转移流程</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {/* Request entry */}
                      <div className="chain-flow-entry flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-sm">
                        <span className="chain-flow-entry-content">
                          <span className="fallback-icon" aria-hidden="true">&gt;</span>
                          请求入口
                        </span>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />

                      {chain.models.map((m, i) => {
                        const provider = state.providers.find(p => p.id === m.providerId);
                        const isOnline = provider?.status === 'online';
                        return (
                          <div key={i} className="flex items-center gap-2 flex-shrink-0">
                            <div className={cn(
                              'border rounded-lg p-2.5 min-w-[120px] transition-all',
                              !m.enabled ? 'bg-slate-50 border-slate-200 border-dashed' :
                              isOnline ? 'bg-white border-slate-200 shadow-sm' :
                              'bg-red-50 border-red-200'
                            )}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className={cn(
                                  'w-2 h-2 rounded-full',
                                  !m.enabled ? 'bg-slate-300' : isOnline ? 'bg-emerald-500' : 'bg-red-500'
                                )} />
                                <span className="text-[10px] text-slate-400">{provider?.name}</span>
                              </div>
                              <p className="text-xs font-mono font-medium text-slate-700 truncate">{m.modelName}</p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                <span>T:{m.timeout}s</span>
                                <span>R:{m.maxRetries}</span>
                              </div>
                            </div>
                            {i < chain.models.length - 1 && (
                              <div className="flex flex-col items-center flex-shrink-0">
                                <span className="text-[9px] text-red-400 mb-0.5">失败</span>
                                <ArrowRight size={14} className="text-red-300" />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
                      <div className="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-sm">
                        OK 响应
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          dispatch({ type: 'UPDATE_CHAIN', chain: { ...chain, enabled: !chain.enabled } });
                        }}
                        className={cn(
                          'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                          chain.enabled
                            ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        )}
                      >
                        {chain.enabled ? '禁用' : '启用'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingChain(chain); setShowEditor(true); }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <span className="button-content-layer">
                          <span className="fallback-icon" aria-hidden="true">E</span>
                          编辑
                        </span>
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_CHAIN', id: chain.id })}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="button-content-layer">
                          <span className="fallback-icon" aria-hidden="true">X</span>
                          删除
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.chains.length === 0 && (
        <div className="motion-card text-center py-16 bg-white rounded-xl border border-slate-200">
          <GitBranch size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">暂无故障转移链</p>
          <p className="text-xs text-slate-400 mt-1">创建第一条故障转移链来开始使用</p>
        </div>
      )}

      {showEditor && (
        <ChainEditor
          chain={editingChain}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditingChain(undefined); }}
        />
      )}
    </div>
  );
}
