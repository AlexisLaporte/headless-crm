import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AuthGuard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestGuard() {
  const { user } = useAuth();
  if (user) return <Navigate to="/app" replace />;
  return <Outlet />;
}
