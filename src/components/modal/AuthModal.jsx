import { useState, useEffect } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";

/**
 * AuthModal — Rentora
 * -----------------------------------------------------------------------
 * Single modal that handles both Login and Signup via an internal tab.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - initialMode: "login" | "signup"   (defaults to "login")
 *  - onLogin: ({ email, password }) => void
 *  - onSignup: ({ name, email, password }) => void
 *  - onGoogleAuth: () => void          (optional — see default below)
 *  - errorMessage: string              (optional — server-side error, e.g.
 *                                        "Incorrect email or password", shown
 *                                        as a banner above the form)
 *  - isSubmitting: boolean             (optional — disables the submit
 *                                        button and shows a loading label
 *                                        while the parent's onLogin/onSignup
 *                                        promise is in flight)
 *
 * This is UI-only — it does not call any API. Wire `onLogin` / `onSignup`
 * to your AuthContext later, e.g.:
 *
 *   <AuthModal
 *     isOpen={authOpen}
 *     onClose={() => setAuthOpen(false)}
 *     onLogin={(creds) => auth.login(creds)}
 *     onSignup={(data) => auth.signup(data)}
 *     onGoogleAuth={() => auth.loginWithGoogle()}
 *   />
 *
 * GOOGLE OAUTH2:
 * If you don't pass `onGoogleAuth`, the button falls back to a full-page
 * redirect to `${VITE_API_BASE_URL}/oauth2/authorization/google`, which is
 * Spring Security's default OAuth2 login endpoint — the browser leaves the
 * SPA, Google handles consent, and Spring redirects back with a session /
 * JWT depending on how you've configured the success handler. Set
 * VITE_API_BASE_URL in your .env if your backend isn't on the same origin.
 * -----------------------------------------------------------------------
 */

// Single source of truth for password rules — used by both the submit
// validator and the live checklist below the field.
const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { key: "lower", label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { key: "number", label: "One number", test: (pw) => /\d/.test(pw) },
  { key: "symbol", label: "One symbol (!@#$…)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function validatePassword(password) {
  if (!password) return "Password is required";
  const unmet = PASSWORD_REQUIREMENTS.find((req) => !req.test(password));
  return unmet ? "Password doesn't meet all requirements below" : "";
}

function PasswordChecklist({ password }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 pl-1">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const passed = req.test(password);
        return (
          <div key={req.key} className="flex items-center gap-1.5">
            {passed ? (
              <CheckCircle2 size={13} className="shrink-0 text-green-400" />
            ) : (
              <Circle size={13} className="shrink-0 text-white/20" />
            )}
            <span
              className={`text-[11px] transition-colors ${
                passed ? "text-white/70" : "text-white/35"
              }`}
            >
              {req.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onLogin,
  onSignup,
  onGoogleAuth,
  errorMessage = "",
  isSubmitting = false,
}) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
     
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(initialMode);
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
     
    function handleEsc(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => (err[name] ? { ...err, [name]: "" } : err));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
  };

  const validate = () => {
    const next = {};

    if (mode === "signup" && !form.name.trim()) {
      next.name = "Full name is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }

    if (mode === "signup") {
      const passwordError = validatePassword(form.password);
      if (passwordError) next.password = passwordError;

      if (!form.confirmPassword) {
        next.confirmPassword = "Please re-enter your password";
      } else if (form.confirmPassword !== form.password) {
        next.confirmPassword = "Passwords don't match";
      }
    } else if (!form.password) {
      next.password = "Password is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    if (mode === "login") {
      onLogin?.({ email: form.email, password: form.password });
    } else {
      onSignup?.({ name: form.name, email: form.email, password: form.password });
    }
  };

  const handleGoogleAuth = () => {
    if (onGoogleAuth) {
      onGoogleAuth();
      return;
    }
    const base = import.meta.env.VITE_API_BASE_URL || "";
    window.location.href = `${base}/oauth2/authorization/google`;
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center rt-font-body px-4"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* card */}
      <div className="relative w-full max-w-100 overflow-hidden rounded-2xl border border-white/10 bg-[#262019] shadow-2xl shadow-black/50">
        {/* ambient glow */}
        <div className="rt-glow pointer-events-none absolute -right-16 -top-20 h-56 w-56 blur-3xl" />

        {/* close */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/8 hover:text-white transition-colors"
        >
          <X size={17} />
        </button>

        <div className="relative px-7 pt-8 pb-7">
          {/* header */}
          <h2 className="rt-font-display text-[20px] font-semibold text-white">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-[13px] text-white/50">
            {mode === "login"
              ? "Log in to book rentals and events on Rentora."
              : "Join Rentora to start booking or listing your place."}
          </p>

          {/* tabs */}
          <div className="mt-5 flex rounded-full border border-white/10 bg-white/3 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-full py-1.5 text-[13px] font-medium transition-colors ${
                mode === "login"
                  ? "rt-gradient-ring text-white shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-full py-1.5 text-[13px] font-medium transition-colors ${
                mode === "signup"
                  ? "rt-gradient-ring text-white shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/3 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-white/[0.07]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[11.5px] uppercase tracking-wide text-white/35">
              or continue with email
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-400">
              {errorMessage}
            </p>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
            {mode === "signup" && (
              <Field
                icon={User}
                name="name"
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
            )}

            <Field
              icon={Mail}
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <div>
              <Field
                icon={Lock}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                required
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {mode === "signup" && (
                <PasswordChecklist password={form.password} />
              )}
            </div>

            {mode === "signup" && (
              <Field
                icon={Lock}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            )}

            {mode === "login" && (
              <button
                type="button"
                className="self-end text-[12.5px] text-white/50 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rt-gradient-ring mt-2 rounded-full py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-[#C2542D]/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? mode === "login"
                  ? "Logging in…"
                  : "Creating account…"
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-[12.5px] text-white/50">
            {mode === "login" ? (
              <>
                New to Rentora?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="rt-gradient-text font-medium"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="rt-gradient-text font-medium"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

function Field({ icon: Icon, endAdornment, error, ...inputProps }) {
  return (
    <div>
      <div
        className={`flex items-center gap-2.5 rounded-xl border bg-white/3 px-3.5 py-2.5 transition-colors focus-within:border-white/25 ${
          error ? "border-red-500/50" : "border-white/10"
        }`}
      >
        <Icon size={16} strokeWidth={2} className="shrink-0 text-white/40" />
        <input
          {...inputProps}
          className="w-full bg-transparent text-[13.5px] text-white placeholder:text-white/35 focus:outline-none"
        />
        {endAdornment}
      </div>
      {error && <p className="mt-1.5 pl-1 text-[11.5px] text-red-400">{error}</p>}
    </div>
  );
}