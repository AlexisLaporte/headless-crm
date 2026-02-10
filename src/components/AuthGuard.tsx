import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestGuard() {
  const { user, loading } = useAuth();

  // Persist return_to across login redirects (MCP OAuth flow)
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('return_to');
  if (returnTo) localStorage.setItem('hcrm_return_to', returnTo);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    const pending = localStorage.getItem('hcrm_return_to');
    if (pending) {
      localStorage.removeItem('hcrm_return_to');
      // Server-side redirect (OAuth authorize endpoint)
      window.location.href = pending;
      return null;
    }
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
