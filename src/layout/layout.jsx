import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import AuthModal from "../components/modal/AuthModal.jsx";
import { useAuthStore } from "../stores/Authstore.js";
import toast from "react-hot-toast";

/**
 * Layout — Rentora
 * -----------------------------------------------------------------------
 * Navbar is rendered once here, so auth state and the AuthModal live here
 * too. Every page under <Outlet /> can reach auth via useOutletContext()
 * instead of each page managing its own modal.
 *
 * All real auth state comes from useAuthStore (Zustand) — the only local
 * state here is UI-only: whether the modal is open, which tab, and the
 * latest server-side auth error to display in it.
 * -----------------------------------------------------------------------
 */
function Layout() {
  const { initialize, user, isAuthenticated, login, signup, logout } =
    useAuthStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAuth = (mode = "login") => {
    setAuthError("");
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
    setAuthError("");
  };

  const handleLogin = async (credentials) => {
    setAuthError("");
    setIsSubmitting(true);
    const result = await login(credentials);
    setIsSubmitting(false);

    if (result.success) {
        toast.success("Logged in successfully!");
      closeAuth();
    } else {
      setAuthError(result.error);
    }
  };

  const handleSignup = async (details) => {
    setAuthError("");
    setIsSubmitting(true);
    const result = await signup(details);
    setIsSubmitting(false);

    if (result.success) {
      closeAuth();
    } else {
      setAuthError(result.error);
    }
  };

  useEffect(() => {
    initialize(); // attempts silent refresh via the cookie on app load
  }, [initialize]);

  return (
    <div className="min-h-screen bg-[#1C1917]">
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginClick={() => openAuth("login")}
        onSignupClick={() => openAuth("signup")}
        onLogout={logout}
      />

      <main>
        {/* Every child route can call useOutletContext() to get these */}
        <Outlet context={{ isAuthenticated, user, openAuth, logout }} />
      </main>

      <AuthModal
        isOpen={authOpen}
        onClose={closeAuth}
        initialMode={authMode}
        onLogin={handleLogin}
        onSignup={handleSignup}
        errorMessage={authError}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default Layout;