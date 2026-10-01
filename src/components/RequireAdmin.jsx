import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/AdminAuthstore.js';

export default function RequireAdmin({ children }) {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAdminAuthStore((s) => s.isInitializing);
  const initialize = useAdminAuthStore((s) => s.initialize);

  // restore the session from the refresh cookie (only on admin pages, not the public site)
  useEffect(() => {
    if (!isAuthenticated && isInitializing) {
      initialize();
    }
  }, [isAuthenticated, isInitializing, initialize]);

  if (isAuthenticated) return children;
  if (isInitializing) return null; // or a spinner while the refresh runs
  return <Navigate to="/admin/login" replace />;
}