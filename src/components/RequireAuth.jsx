import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/Authstore.js'; // 
import {toast} from 'react-hot-toast';
import { useEffect } from 'react';
export default function RequireAuth() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const authIsLoading = useAuthStore((s) => s.isLoading);
  useEffect(()=>{
    if (authIsLoading) return;
  },[authIsLoading]);
  // wait for the startup refresh, or a page reload logs everyone out
  if (isInitializing || authIsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  

  if (!isAuthenticated) {
    // send them home, remembering where they were trying to go
    toast.error("You must be logged in to access this page.");
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}