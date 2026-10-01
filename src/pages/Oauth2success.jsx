import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/Authstore";

/**
 * OAuth2Success — Rentora
 * -----------------------------------------------------------------------
 * Your Spring backend's Oauthsec success handler sets the refresh-token
 * cookie and redirects here (e.g. `/oauth2/success`) — WITHOUT putting the
 * access token in the URL (see the earlier note on why that's unsafe).
 *
 * This page's only job: call refresh() to trade that cookie for an access
 * token, same as any other silent refresh, then bounce to the homepage.
 *
 * Route it in App.jsx:
 *   <Route path="/oauth2/success" element={<OAuth2Success />} />
 * 
 */
function OAuth2Success() {
  const navigate = useNavigate();
  const refresh = useAuthStore((s) => s.refresh);

  useEffect(() => {
    refresh()
      .then(() => navigate("/", { replace: true }))
      .catch(() => navigate("/?authError=google", { replace: true }));
  }, [refresh, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1C1917]">
      <p className="rt-font-body text-[14px] text-white/50">
        Finishing sign-in…
      </p>
    </div>
  );
}

export default OAuth2Success;