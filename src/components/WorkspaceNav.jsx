import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Code2,
  BookOpen,
  ClipboardCheck,
  Users,
  Building2,
  UserRound,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Plus,
  ShieldCheck,
} from "lucide-react";
import getUserId from "../services/getUserId";
import logout from "../services/logout";
import { Brand } from "./ui";
import useDialog from "../hooks/useDialog";

const roleLabels = {
  student: "Student workspace",
  recruiter: "Recruiter workspace",
  tpo: "Placement workspace",
  admin: "Admin workspace",
};
export default function WorkspaceNav({ role = "student" }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useDialog(open, () => setOpen(false));
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const userId = getUserId();
  const base = `/${role}/${userId}`;
  const home = role === "admin" ? "/admin" : `${base}/home`;
  const links =
    role === "student"
      ? [
          [home, "Overview", LayoutDashboard],
          [`${base}/apply-jobs`, "Find opportunities", BriefcaseBusiness],
          [`${base}/applications`, "My applications", FileText],
          ["/student/practice", "Coding studio", Code2],
          [`${base}/coding-assessments`, "Assessments", ClipboardCheck],
          ["/student/resources", "Resource library", BookOpen],
        ]
      : role === "recruiter"
        ? [
            [home, "Overview", LayoutDashboard],
            [`${base}/jobpostings`, "Job postings", BriefcaseBusiness],
            [`${base}/applications`, "Applications", FileText],
          ]
        : role === "tpo"
          ? [
              [home, "Overview", LayoutDashboard],
              [`${base}/students`, "Students", Users],
              [`${base}/recruiters`, "Recruiters", Building2],
              [
                `${base}/coding-assessment/create`,
                "Create assessment",
                ClipboardCheck,
              ],
            ]
          : [
              [home, "Overview", LayoutDashboard],
              ["/admin/create-user", "Create user", Plus],
              ["/admin/AdminAccessForm", "Manage access", ShieldCheck],
            ];
  const current =
    links.find(([path]) => path === location.pathname)?.[1] ||
    (location.pathname.includes("profile") ? "My profile" : "Workspace");
  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const close = (e) => {
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const signOut = async () => {
    await logout();
    navigate(role === "admin" ? "/tpo/login" : `/${role}/login`);
  };
  return (
    <>
      {open && (
        <button
          className="cn-nav-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={drawerRef}
        className={`cn-sidebar ${open ? "is-open" : ""}`}
        aria-label={`${role} navigation`}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        tabIndex={-1}
      >
        <div className="cn-sidebar-brand">
          <Brand to={home} />
          <button
            className="cn-mobile-close cn-icon-button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className="cn-workspace-label">
          <span className="cn-status-dot" />
          {roleLabels[role]}
        </div>
        <p className="cn-nav-label">WORKSPACE</p>
        <nav className="cn-nav-links">
          {links.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              end
              to={path}
              className={({ isActive }) =>
                `cn-nav-link ${isActive ? "is-active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
              {path === location.pathname && (
                <span className="cn-nav-active-dot" />
              )}
            </NavLink>
          ))}
        </nav>
        {role !== "admin" && (
          <>
            <p className="cn-nav-label cn-account-label">ACCOUNT</p>
            <NavLink
              to={`${base}/profile?page=update`}
              className={({ isActive }) =>
                `cn-nav-link ${isActive ? "is-active" : ""}`
              }
            >
              <UserRound size={19} />
              My profile
            </NavLink>
          </>
        )}
        <div className="cn-sidebar-bottom">
          <div className="cn-sidebar-tip">
            <span>MAKE YOUR NEXT MOVE</span>
            <strong>
              {role === "student"
                ? "Small steps. Big futures."
                : "Good people. Great futures."}
            </strong>
            <p>
              {role === "student"
                ? "A little preparation today goes a long way."
                : "Connect talent with the right opportunity."}
            </p>
            <NavLink
              to={
                role === "student"
                  ? "/student/practice"
                  : role === "admin"
                    ? "/admin/create-user"
                    : role === "tpo"
                      ? `${base}/students`
                      : `${base}/jobpostings`
              }
            >
              {role === "student" ? "Keep practicing" : "Get started"}
              <ArrowUpRight size={16} />
            </NavLink>
          </div>
          <button className="cn-nav-link cn-signout" onClick={signOut}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <header className="cn-topbar">
        <div className="cn-breadcrumb">
          <button
            className="cn-menu-toggle cn-icon-button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
          >
            <Menu size={21} />
          </button>
          <span>{roleLabels[role].split(" ")[0]}</span>
          <span className="cn-breadcrumb-slash">/</span>
          <strong>{current}</strong>
        </div>
        <div className="cn-topbar-end">
          <span className="cn-today">
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date())}
          </span>
          <div className="cn-profile-menu" ref={profileRef}>
            <button
              className="cn-profile-trigger"
              aria-expanded={profileOpen}
              aria-label="Account menu"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <span className="cn-avatar">
                {role === "student"
                  ? "S"
                  : role === "recruiter"
                    ? "R"
                    : role === "tpo"
                      ? "P"
                      : "A"}
              </span>
              <span className="cn-profile-text">
                <strong>{userId || "Your account"}</strong>
                <small>
                  {role === "tpo"
                    ? "Placement officer"
                    : role[0].toUpperCase() + role.slice(1)}
                </small>
              </span>
              <ChevronDown size={15} />
            </button>
            {profileOpen && (
              <div className="cn-dropdown">
                {role !== "admin" && (
                  <NavLink to={`${base}/profile?page=update`}>
                    <UserRound size={16} />
                    My profile
                  </NavLink>
                )}
                <button onClick={signOut}>
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
