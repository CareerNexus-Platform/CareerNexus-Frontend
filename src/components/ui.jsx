import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Inbox,
  BriefcaseBusiness,
  Code2,
  Route,
  Compass
} from "lucide-react";
import NexusLogo from "./NexusLogo";

export function Brand({ to = "/", compact = false, light = false }) {
  return (
    <Link to={to} className="cn-brand" aria-label="CareerNexus home">
      <span className="cn-brand-mark">
        <NexusLogo className="w-6 h-auto" light={light} />
      </span>
      {!compact && (
        <span>
          Career<span className="cn-brand-accent">Nexus</span>
          <small>YOUR NEXT CHAPTER</small>
        </span>
      )}
    </Link>
  );
}
export function Reveal({ children, className = "", delay = 0 }) {
  return (
    <Motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Motion.div>
  );
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="cn-page-heading">
      <div>
        {eyebrow && <p className="cn-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="cn-page-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  to,
  action,
}) {
  return (
    <div className="cn-empty">
      <span className="cn-empty-icon">
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {to && (
        <Link className="cn-text-link" to={to}>
          {action || "Explore opportunities"}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  tone = "teal",
  loading,
}) {
  return (
    <div className="cn-stat">
      <div className="cn-stat-top">
        <span>{label}</span>
        <span className={`cn-icon-tile ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      {loading ? (
        <span className="cn-skeleton cn-stat-skeleton" />
      ) : (
        <strong>{value}</strong>
      )}
      <p>{caption}</p>
    </div>
  );
}
export function Footer() {
  return (
    <footer className="cn-footer">
      <span>© {new Date().getFullYear()} CareerNexus</span>
      <span>A little clarity. A world of possibility.</span>
      <Link to="/">
        Back to home <ArrowUpRight size={13} />
      </Link>
    </footer>
  );
}
export function CareerArtwork() {
  return (
    <div className="cn-artwork" aria-hidden="true">
      <div className="cn-journey-board">
        <div className="cn-board-chrome">
          <span>
            <i />
            <i />
            <i />
          </span>
          <small>CAREERNEXUS / YOUR WORKSPACE</small>
          <Compass size={15} />
        </div>
        <div className="cn-board-title">
          <span>FROM AMBITION TO OPPORTUNITY</span>
          <strong>
            Your next step,
            <br />
            clearly in view.
          </strong>
        </div>
        <div className="cn-board-steps">
          {[
            [
              BriefcaseBusiness,
              "01",
              "Discover opportunities",
              "Find a role that fits your ambitions.",
            ],
            [
              Code2,
              "02",
              "Build your confidence",
              "Practice, prepare, and sharpen your skills.",
            ],
            [
              Route,
              "03",
              "Keep moving forward",
              "Follow each application in one place.",
            ],
          ].map(([Icon, number, title, description]) => (
            <div className="cn-board-step" key={number}>
              <span className="cn-board-icon">
                <Icon size={20} />
              </span>
              <div>
                <small>STEP {number}</small>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <ArrowUpRight size={17} />
            </div>
          ))}
        </div>
        <div className="cn-board-footer">
          <span className="cn-board-status" />A focused space for your next
          chapter.
        </div>
      </div>
    </div>
  );
}
