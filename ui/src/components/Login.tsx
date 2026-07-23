import { FormEvent, useState } from 'react';
import { LockKeyhole, Moon, Sun } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils/cn';
import { LoadingSpinner } from './Loading';

export default function Login({
  theme,
  onToggleTheme,
}: {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  const { state, login } = useStore();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const busy = state.saveStatus === 'loading';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await login(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  };

  return (
    <div data-theme={theme} className="uiverse-login flex min-h-dvh items-center justify-center bg-slate-950 px-3 py-6 sm:px-4">
      <div className="uiverse-login-backdrop absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_78%_12%,rgba(20,184,166,0.14),transparent_30%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)]" />
      <button
        type="button"
        onClick={onToggleTheme}
        className="uiverse-theme-toggle absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/10 text-slate-100 backdrop-blur transition-colors hover:bg-white/20"
        aria-label={theme === 'dark' ? '切换亮色模式' : '切换暗色模式'}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <form
        onSubmit={handleSubmit}
        className="uiverse-login-card page-motion relative w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-5 shadow-2xl shadow-blue-950/30 backdrop-blur sm:p-7"
      >
        <div className="mb-6">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <LockKeyhole size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">登录 Failover-Proxy</h1>
          <p className="mt-1 text-sm text-slate-500">请输入 Admin Token。服务重启后需要重新登录。</p>
        </div>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Admin Token</span>
          <input
            value={token}
            onChange={event => setToken(event.target.value)}
            autoFocus
            type="password"
            placeholder="输入管理令牌"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        {error && (
          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !token.trim()}
          className={cn(
            'mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
          )}
        >
          {busy && <LoadingSpinner size="sm" />}
          登录
        </button>
      </form>
    </div>
  );
}
