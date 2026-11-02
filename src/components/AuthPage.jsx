import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  LoaderCircle,
  Check,
  GraduationCap,
  Building2,
  School,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Brand, Reveal } from "./ui";
import { backendOrigin, apiErrorMessage } from "../services/apiConfig";
import { getSession, safeReturnPath, workspaceHome } from "../services/session";
const roleNames = {
  student: "Student",
  recruiter: "Recruiter",
  tpo: "Placement officer",
};
export default function AuthPage({ role = "student", signup = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const session = getSession();
    if (
      session &&
      (session.role === role || (session.role === "admin" && role === "tpo"))
    )
      navigate(
        safeReturnPath(location.state?.from, session) || workspaceHome(session),
        {
          replace: true,
        },
      );
  }, [navigate, role, location.state]);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const base = backendOrigin;
      if (signup) {
        await axios.post(`${base}/auth/student/register`, {
          userId: userId.trim(),
          email,
          password,
        });
        toast.success("Your account is ready. Sign in to get started.");
        navigate("/student/login");
      } else {
        const { data } = await axios.post(`${base}/auth/login`, {
          userId: userId.trim(),
          password,
          role,
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", userId.trim());
        localStorage.setItem("role", data.role || role);
        toast.success("Welcome back. Your next chapter awaits.");
        const session = getSession();
        const setup = data.router?.startsWith("/profile")
          ? `/${session.role}/${encodeURIComponent(session.userId)}${data.router}`
          : null;
        const intended = safeReturnPath(location.state?.from, session);
        navigate(
          setup
            ? setup +
                (intended ? `&returnTo=${encodeURIComponent(intended)}` : "")
            : intended || workspaceHome(session),
          { replace: true },
        );
      }
    } catch (err) {
      const message = apiErrorMessage(
        err,
        signup
          ? "We couldn’t create your account. Check your details and try again."
          : "Check your user ID, password, and workspace, then try again.",
      );
      setError(
        typeof message === "string"
          ? message
          : signup
            ? "We couldn’t create your account. Check your details and try again."
            : "We couldn’t sign you in. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const RoleIcon =
    role === "student"
      ? GraduationCap
      : role === "recruiter"
        ? Building2
        : School;
  return (
    <div className="cn-auth">
      <aside className="cn-auth-story">
        <Brand />
        <div className="cn-auth-story-copy">
          <span className="cn-eyebrow">
            A LITTLE CLARITY. A WORLD OF POSSIBILITY.
          </span>
          <h1>
            Every great story
            <br />
            starts with
            <br />
            <em>a next step.</em>
          </h1>
          <p>
            Your ambitions deserve a space to grow.
            <br />
            Let's make room for what comes next.
          </p>
          <div className="cn-auth-journey">
            <span>
              <Check size={14} />
            </span>
            <i />
            <span>
              <Check size={14} />
            </span>
            <i />
            <span>
              <ArrowUpRightIcon />
            </span>
          </div>
          <div className="cn-auth-journey-labels">
            <span>Discover</span>
            <span>Prepare</span>
            <span>Grow</span>
          </div>
        </div>
        <span className="cn-auth-story-footer">
          Built for brighter futures.
        </span>
      </aside>
      <main className="cn-auth-main">
        <Link className="cn-auth-back" to={`/${role}`}>
          <ArrowLeft size={16} />
          Back to {role === "tpo" ? "institutions" : `${role}s`}
        </Link>
        <Reveal className="cn-auth-form-wrap">
          <span className="cn-auth-role">
            <RoleIcon size={16} />
            {roleNames[role]} workspace
          </span>
          <h2>
            {signup ? "A new chapter starts here." : "Good to see you again."}
          </h2>
          <p>
            {signup
              ? "Create your student account and take the first step."
              : "Sign in to pick up where you left off."}
          </p>
          {!signup && (
            <nav
              className="cn-auth-role-tabs"
              aria-label="Choose your workspace"
            >
              {Object.entries(roleNames).map(([key, label]) => (
                <Link
                  key={key}
                  to={`/${key}/login`}
                  aria-current={role === key ? "page" : undefined}
                  className={role === key ? "active" : ""}
                >
                  {key === "tpo" ? "Institution" : label}
                </Link>
              ))}
            </nav>
          )}
          {location.state?.expired && (
            <div className="cn-auth-expired" role="status">
              Your session ended. Sign in to continue where you left off.
            </div>
          )}
          <form onSubmit={submit} className="cn-auth-form">
            <label htmlFor="auth-user">
              {role === "student" ? "Roll number / User ID" : "User ID"}
              <input
                id="auth-user"
                name="username"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={
                  role === "student"
                    ? "Enter your roll number"
                    : "Enter your user ID"
                }
                required
                disabled={busy}
              />
            </label>
            {signup && (
              <label htmlFor="auth-email">
                Email address
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  required
                  disabled={busy}
                />
              </label>
            )}
            <label htmlFor="auth-password">
              Password
              <span className="cn-password-field">
                <input
                  id="auth-password"
                  name="password"
                  autoComplete={signup ? "new-password" : "current-password"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    signup ? "Create a password" : "Enter your password"
                  }
                  required
                  disabled={busy}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            {!signup && role === "student" && (
              <div className="cn-auth-help">
                <Link to="/student/forgot-password">Need help signing in?</Link>
              </div>
            )}
            {error && (
              <div role="alert" className="cn-form-error">
                {error}
              </div>
            )}
            <button
              className="cn-button cn-auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <>
                  <LoaderCircle className="animate-spin" size={17} />
                  {signup ? "Creating your account…" : "Signing you in…"}
                </>
              ) : (
                <>
                  {signup ? "Create account" : "Sign in to your workspace"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          {role === "student" && (
            <p className="cn-auth-switch">
              {signup ? "Already have an account?" : "New here?"}{" "}
              <Link to={signup ? "/student/login" : "/student/signup"}>
                {signup ? "Sign in" : "Create an account"}
                <ArrowUpRightIcon />
              </Link>
            </p>
          )}
          <p className="cn-auth-security">
            <ShieldCheck size={14} />
            Your journey. Your secure workspace.
          </p>
        </Reveal>
        <footer>
          © {new Date().getFullYear()} CareerNexus{" "}
          <Link to="/">Back to home</Link>
        </footer>
      </main>
    </div>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
