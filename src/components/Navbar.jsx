import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Bell,
  CalendarDays,
  Building2,
  Settings,
  LogOut,
  UserRound,
  Inbox,
  Trophy,
  Brackets,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; 


/**
 * Navbar — Rentora
 * -----------------------------------------------------------------------
 * Dark UI with a terracotta → sand gradient signature (Kathmandu brick
 * terracotta, fading into a muted sand/gold) accenting the wordmark and
 * CTAs.
 *
 * AUTH WIRING:
 * Everything below the "AUTH STATE" comment is placeholder state meant to
 * be swapped for your real AuthContext later, e.g.:
 *
 *   const { isAuthenticated, user, logout } = useAuth();
 *
 * `user` is expected to look like: { name, email, avatarUrl }
 * If `user.avatarUrl` is empty, initials are rendered instead.
 * -----------------------------------------------------------------------
 */

const NAV_LINKS = [
  { label: "Browse live", href: "/live", icon: Building2 },
  { label: "Events", href: "/events", icon: CalendarDays },
];

export default function Navbar({
  onLoginClick,
  onSignupClick,
  // Pass these down once you have AuthContext, e.g.:
  //   const { isAuthenticated, user, logout } = useAuth();
  //   <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={logout} ... />
  // If omitted, Navbar falls back to local demo state below (handy for
  // previewing the component on its own).
  isAuthenticated: isAuthenticatedProp,
  user: userProp,
  onLogout,
} = {}) {
  // ---------------- AUTH STATE (demo fallback — replace with useAuth() later) ----------------
  const [demoAuthenticated, setDemoAuthenticated] = useState(true);
  const [demoUser] = useState({
    name: "Yukesh Adhikari",
    email: "yukesh@rentora.com",
    avatarUrl: "", // leave empty to show initials
  });

  const isControlled = isAuthenticatedProp !== undefined;
  const isAuthenticated = isControlled ? isAuthenticatedProp : demoAuthenticated;
  const user = isControlled ? userProp : demoUser;
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
      navigate("/")
    }
    else setDemoAuthenticated(false);
  };
  // console.log("Navbar render: isAuthenticated=", isAuthenticated, "user=", user);
  

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .rt-font-display { font-family: 'Outfit', sans-serif; }
        .rt-font-body { font-family: 'Inter', sans-serif; }
        .rt-gradient-text {
          background: linear-gradient(90deg, #C2542D 0%, #D4A574 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .rt-gradient-ring {
          background: linear-gradient(135deg, #C2542D 0%, #D4A574 100%);
        }
        .rt-glow {
          background: radial-gradient(circle, rgba(194,84,45,0.35) 0%, rgba(212,165,116,0.12) 45%, transparent 70%);
        }
        .rt-link {
          position: relative;
        }
        .rt-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 100%;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #C2542D, #D4A574);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .rt-link:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      <header className="sticky top-0 z-50 w-full border-b border-white/6 bg-[#1C1917]/80 backdrop-blur-xl rt-font-body">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ambient glow behind logo */}
          <div className="rt-glow pointer-events-none absolute -left-10 -top-16 h-40 w-40 blur-2xl" />

          {/* Logo / wordmark */}
          <a
            href="/"
            className="relative z-10 flex items-center gap-2.5 shrink-0"
            aria-label="Rentora home"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="rt-mark" x1="0" y1="32" x2="32" y2="0">
                  <stop offset="0%" stopColor="#C2542D" />
                  <stop offset="100%" stopColor="#D4A574" />
                </linearGradient>
              </defs>
              {/* minimal Kathmandu-valley skyline mark */}
              <path
                d="M2 24L8 14L12 19L17 9L22 17L26 12L30 24H2Z"
                fill="url(#rt-mark)"
              />
              <circle cx="17" cy="6" r="2" fill="url(#rt-mark)" />
            </svg>
            <span className="rt-font-display text-[19px] font-semibold tracking-tight text-white">
              Rent<span className="rt-gradient-text">ora</span>
            </span>
          </a>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rt-link flex items-center gap-1.5 text-[14px] font-medium text-white/70 hover:text-white transition-colors"
              >
                <link.icon size={15} strokeWidth={2} className="opacity-70" />
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="relative z-10 flex items-center gap-3">
            {/* "List your place" CTA — desktop only */}
            <a
              href="/Managelisting"
              className="hidden lg:inline-flex items-center rounded-full px-4 py-2 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/6 transition-colors"
            >
              List your Items
            </a>

            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <button
                  type="button"
                  aria-label="Notifications"
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                >
                  <Bell size={17} strokeWidth={2} />
                </button>

                {/* Account menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-2.5 hover:border-white/20 hover:bg-white/4 transition-colors"
                  >
                    <span className="rt-gradient-ring flex h-7 w-7 items-center justify-center rounded-full p-[1.5px]">
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#1C1917] overflow-hidden">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-[10px] font-semibold text-white">
                            {initials}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="hidden sm:block max-w-30 truncate text-[13px] font-medium text-white/85">
                      {user?.name || user?.email}
                    </span>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className={`text-white/50 transition-transform ${
                        menuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#262019] shadow-2xl shadow-black/40">
                      <div className="px-4 py-3 border-b border-white/6">
                        <p className="truncate text-[13px] font-medium text-white">
                          {user?.name}
                        </p>
                        <p className="truncate text-[12px] text-white/50">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1.5">
                        <MenuItem icon={UserRound} label="Profile" href="/profile" />
                        <MenuItem icon={Building2} label="My listings" href="/Managelisting" />
                        <MenuItem icon={CalendarDays} label="My bookings" href="/bookings" />
                        <MenuItem icon={Inbox} label="Bookings received" href="/owner-bookings" />
                        <MenuItem icon={Trophy} label="Tournaments" href="/tournaments" />
                        <MenuItem icon={Brackets} label="My tournaments" href="/owner-Tournaments" />
                        <MenuItem icon={BarChart3} label="Analytics" href="/analytics" />
                        <MenuItem icon={Settings} label="Settings" href="/settings" />
                      </div>
                      <div className="border-t border-white/6 py-1.5">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-red-400 hover:bg-white/6 transition-colors"
                        >
                          <LogOut size={15} strokeWidth={2} />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLoginClick?.()}
                  className="rounded-full px-4 py-2 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/6 transition-colors"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => onSignupClick?.()}
                  className="rt-gradient-ring rounded-full px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-[#C2542D]/20 hover:opacity-90 transition-opacity"
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/6 transition-colors md:hidden"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/6 bg-[#1C1917] px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/80 hover:bg-white/6 transition-colors"
                >
                  <link.icon size={16} strokeWidth={2} className="opacity-70" />
                  {link.label}
                </a>
              ))}
              <a
                href="/Managelisting"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/80 hover:bg-white/6 transition-colors"
              >
                List your items
              </a>
            </nav>

            {!isAuthenticated && (
              <div className="mt-3 flex flex-col gap-2 border-t border-white/6 pt-3">
                <button
                  type="button"
                  onClick={() => onLoginClick?.()}
                  className="rounded-full border border-white/15 px-4 py-2.5 text-center text-[13px] font-medium text-white"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => onSignupClick?.()}
                  className="rt-gradient-ring rounded-full px-4 py-2.5 text-center text-[13px] font-semibold text-white"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}

function MenuItem({ icon: Icon, label, href }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/80 hover:bg-white/5 hover:text-white transition-colors"
    >
      <Icon size={15} strokeWidth={2} className="opacity-70" />
      {label}
    </a>
  );
}