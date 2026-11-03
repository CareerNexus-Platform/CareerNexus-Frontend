import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./ui";
import { getSession, workspaceHome } from "../services/session";
export default function PublicNav() {
  const session = getSession();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="cn-public-header">
      <div className="cn-public-nav">
        <Brand />
        <nav className={open ? "is-open" : ""} aria-label="Main navigation">
          <a href="/#features" onClick={() => setOpen(false)}>
            Why CareerNexus
          </a>
          <NavLink to="/student">For students</NavLink>
          <NavLink to="/recruiter">For recruiters</NavLink>
          <NavLink to="/tpo">For institutions</NavLink>
          <Link
            to={session ? workspaceHome(session) : "/#workspaces"}
            className="cn-button"
          >
            {session ? "Open workspace" : "Get started"}{" "}
            <ArrowUpRight size={15} />
          </Link>
        </nav>
        <button
          className="cn-public-menu cn-icon-button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
