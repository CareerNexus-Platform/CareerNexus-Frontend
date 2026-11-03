import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../services/session";

export default function SessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const expire = () => {
      const role =
        localStorage.getItem("role") || location.pathname.split("/")[1];
      clearSession();
      if (
        /\/(login|signup)$/.test(location.pathname) ||
        location.pathname === "/"
      )
        return;
      navigate(
        role === "admin" || role === "tpo"
          ? "/tpo/login"
          : role === "recruiter"
            ? "/recruiter/login"
            : "/student/login",
        {
          replace: true,
          state: { from: location.pathname + location.search, expired: true },
        },
      );
    };
    const onStorage = () => {
      if (!getSession()) expire();
    };
    window.addEventListener("careernexus:session-expired", expire);
    window.addEventListener("storage", onStorage);
    const session = getSession();
    const timer = session
      ? setTimeout(expire, Math.min(session.expiresAt - Date.now(), 2147483647))
      : null;
    return () => {
      clearTimeout(timer);
      window.removeEventListener("careernexus:session-expired", expire);
      window.removeEventListener("storage", onStorage);
    };
  }, [location.pathname, location.search, navigate]);
  return null;
}
