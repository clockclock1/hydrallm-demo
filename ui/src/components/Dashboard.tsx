import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  GitBranch,
  Server,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils/cn';
import AnimatedGlyph from './AnimatedGlyph';

function successRate(successes: number, failures: number) {
  const finished = successes + failures;
  return finished ? Number(((successes / finished) * 100).toFixed(1)) : 100;
}

function StatCard({ icon, label, value, sub, color, delay = 0 }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay?: number;
}) {
  return (
    <div className="motion-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-lg" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold text-slate-800">{value}</p>
          {sub && <p className="mt-1 truncate text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 hover:scale-110', color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useStore();
  const stats = state.backendStats;
  const onlineProviders = state.providers.filter(p => p.status === 'online').length;
  const totalModels = state.providers.reduce((sum, p) => sum + p.models.length, 0);
  const enabledChains = state.chains.filter(c => c.enabled).length;
  const totalRequests = stats?.requests ?? state.chains.reduce((sum, c) => sum + c.totalRequests, 0);
  const totalFailovers = stats?.failovers ?? state.chains.reduce((sum, c) => sum + c.failoverCount, 0);
  const avgSuccessRate = stats
    ? successRate(stats.successes || 0, stats.failures || 0).toFixed(1)
    : state.chains.length
      ? (state.chains.reduce((sum, c) => sum + c.successRate, 0) / state.chains.length).toFixed(1)
      : '100.0';

  return (
    <div className="page-motion space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <AnimatedGlyph variant="overview" />
            Persisted Overview
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">仪表盘</h2>
          <p className="mt-1 text-slate-500">模型故障转移代理的持久化运行概览。</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          <span className="font-mono text-slate-800">{state.chains.length}</span> 条链，
          <span className="font-mono text-slate-800">{totalModels}</span> 个模型
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Server size={20} className="text-blue-600" />}
          label="在线提供商"
          value={`${onlineProviders} / ${state.providers.length}`}
          sub={`共 ${totalModels} 个模型`}
          color="bg-blue-50"
        />
        <StatCard
          icon={<GitBranch size={20} className="text-violet-600" />}
          label="故障转移链"
          value={enabledChains}
          sub={`共 ${state.chains.length} 条链`}
          color="bg-violet-50"
          delay={60}
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-emerald-600" />}
          label="总请求数"
          value={totalRequests.toLocaleString()}
          sub={`故障转移 ${totalFailovers.toLocaleString()} 次`}
          color="bg-emerald-50"
          delay={120}
        />
        <StatCard
          icon={<Zap size={20} className="text-amber-600" />}
          label="平均成功率"
          value={`${avgSuccessRate}%`}
          sub="所有转移链"
          color="bg-amber-50"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="motion-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Activity size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">提供商状态</h3>
          </div>
          <div className="max-h-[430px] divide-y divide-slate-50 overflow-auto">
            {state.providers.map((provider, index) => (
              <div key={provider.id} className="table-row-motion flex flex-col items-start gap-3 px-5 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4" style={{ animationDelay: `${index * 25}ms` }}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full',
                    provider.status === 'online' ? 'bg-emerald-500 shadow-sm shadow-emerald-300' :
                    provider.status === 'offline' ? 'bg-red-500 shadow-sm shadow-red-300' :
                    'bg-slate-400'
                  )} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{provider.name}</p>
                    <p className="truncate text-xs text-slate-400">{provider.baseUrl}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-slate-400">{provider.models.length} 模型</span>
                  {provider.latency !== undefined && (
                    <span className={cn(
                      'rounded-full px-2 py-0.5 font-mono text-xs',
                      provider.latency < 300 ? 'bg-emerald-50 text-emerald-600' :
                      provider.latency < 500 ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                    )}>
                      {provider.latency}ms
                    </span>
                  )}
                  {provider.status === 'online' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                    provider.status === 'offline' ? <XCircle size={16} className="text-red-500" /> :
                    <AlertTriangle size={16} className="text-slate-400" />}
                </div>
              </div>
            ))}
            {!state.providers.length && (
              <div className="py-12 text-center text-slate-400">
                <Server size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无提供商</p>
              </div>
            )}
          </div>
        </section>

        <section className="motion-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <GitBranch size={18} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">故障转移链概览</h3>
            </div>
          </div>
          <div className="max-h-[430px] space-y-3 overflow-auto p-4">
            {state.chains.map((chain, chainIndex) => {
              const visibleModels = chain.models.slice(0, 14);
              return (
                <div key={chain.id} className={cn(
                  'table-row-motion rounded-lg border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                  chain.enabled ? 'border-slate-200 bg-slate-50/60' : 'border-slate-200 bg-slate-100 opacity-60'
                )} style={{ animationDelay: `${chainIndex * 40}ms` }}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', chain.enabled ? 'bg-emerald-500' : 'bg-slate-400')} />
                        <span className="truncate text-sm font-semibold text-slate-700">{chain.name}</span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-600">{chain.proxyModelName}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>总请求 {chain.totalRequests.toLocaleString()}</span>
                        <span>转移 {chain.failoverCount.toLocaleString()}</span>
                        <span>成功率 {chain.successRate}%</span>
                        <span>模型 {chain.models.length}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 lg:w-32">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', chain.successRate >= 99 ? 'bg-emerald-500' : chain.successRate >= 90 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${Math.min(100, Math.max(0, chain.successRate))}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {visibleModels.map((model, index) => (
                      <span key={`${model.providerId}-${model.modelName}-${index}`} className={cn(
                        'max-w-[210px] truncate rounded-md border px-2 py-1 font-mono text-[11px] transition-all duration-200 hover:-translate-y-0.5',
                        model.enabled ? 'border-slate-200 bg-white text-slate-700' : 'border-slate-200 bg-slate-100 text-slate-400 line-through'
                      )}>
                        {index + 1}. {model.modelName}
                      </span>
                    ))}
                    {chain.models.length > visibleModels.length && (
                      <span className="rounded-md bg-slate-200 px-2 py-1 text-[11px] text-slate-600">+{chain.models.length - visibleModels.length}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {!state.chains.length && (
              <div className="py-12 text-center text-slate-400">
                <GitBranch size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无故障转移链</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="motion-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <Clock size={18} className="text-slate-600" />
          <h3 className="font-semibold text-slate-800">最近请求日志</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-5 py-2.5 text-left font-medium">时间</th>
                <th className="px-5 py-2.5 text-left font-medium">转移链</th>
                <th className="px-5 py-2.5 text-left font-medium">调用路径</th>
                <th className="px-5 py-2.5 text-left font-medium">状态</th>
                <th className="px-5 py-2.5 text-left font-medium">延迟</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.logs.slice(0, 6).map((log, index) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString('zh-CN');
                return (
                  <tr key={log.id} className="table-row-motion hover:bg-slate-50" style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{timeStr}</td>
                    <td className="px-5 py-3 text-slate-700">{log.chainName}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {log.failedModels.map((model, i) => (
                          <span key={i} className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-xs text-red-500 line-through">{model}</span>
                        ))}
                        {log.failedModels.length > 0 && <ArrowRight size={10} className="text-slate-300" />}
                        <span className={cn('rounded px-1.5 py-0.5 font-mono text-xs', log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500')}>
                          {log.finalModel || '全部失败'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={12} /> 成功</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500"><XCircle size={12} /> 失败</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{log.latency}ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
