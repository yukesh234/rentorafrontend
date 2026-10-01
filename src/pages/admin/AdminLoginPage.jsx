import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '../../stores/AdminAuthstore.js';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login({ email, password });
    setIsSubmitting(false);
    if (result.success) navigate('/admin/dashboard', { replace: true });
    else setError(result.error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1C1917] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#2A2622] bg-[#211D1A] p-6">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <Shield size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">Admin access</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#F5F0EB]">Sign in</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="username"
            required
            className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none focus:border-[#C2542D]/60"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none focus:border-[#C2542D]/60"
          />

          {error && <p className="text-xs text-[#E07856]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C2542D] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#D4A574] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}