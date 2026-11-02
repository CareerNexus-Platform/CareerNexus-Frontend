import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  FileText,
  GraduationCap,
  Building2,
  School,
  Check,
  MoveUpRight,
  Sparkles,
} from "lucide-react";
import PublicNav from "../../components/PublicNav";
import { CareerArtwork, Footer, Reveal } from "../../components/ui";
import { getSession, workspaceHome } from "../../services/session";
const audiences = [
  {
    icon: GraduationCap,
    label: "FOR STUDENTS",
    title: "Your ambition. Your next chapter.",
    text: "Discover campus opportunities, track applications, practice coding, and bring your potential into focus.",
    to: "/student",
    color: "sage",
    cta: "Explore student workspace",
  },
  {
    icon: Building2,
    label: "FOR RECRUITERS",
    title: "Meet your next great hire.",
    text: "Post roles, review applications, and guide candidates through a clearer recruitment process.",
    to: "/recruiter",
    color: "sand",
    cta: "Explore recruiter workspace",
  },
  {
    icon: School,
    label: "FOR INSTITUTIONS",
    title: "Bring every opportunity together.",
    text: "Connect students and recruiters, manage assessments, and keep your campus placement journey organized.",
    to: "/tpo",
    color: "blue",
    cta: "Explore placement workspace",
  },
];
export default function Home() {
  const session = getSession();
  return (
    <div className="cn-marketing">
      <PublicNav />
      <main>
        <section className="cn-landing-hero">
          <Reveal className="cn-hero-copy">
            <span className="cn-marketing-eyebrow">
              <span /> LESS GUESSWORK. MORE MOMENTUM.
            </span>
            <h1>
              Your future.
              <br />
              <em>A clearer path.</em>
            </h1>
            <p>
              Find campus opportunities. Prepare with purpose. Track every
              application. CareerNexus brings your next steps together in one
              focused workspace.
            </p>
            <div className="cn-hero-actions">
              <Link
                to={session ? workspaceHome(session) : "/#workspaces"}
                className="cn-button"
              >
                {session ? "Open my workspace" : "Choose your workspace"}{" "}
                <ArrowUpRight size={18} />
              </Link>
              <a href="#features" className="cn-quiet-link">
                See how it works <ArrowRight size={16} />
              </a>
            </div>
            <div className="cn-hero-footnote">
              <span>
                <Check size={13} />
                Built around your journey
              </span>
              <span>
                <Check size={13} />
                Everything in one place
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="cn-hero-visual">
            <div className="cn-demo-caption">
              <span>YOUR NEXT CHAPTER, IN FOCUS</span>
              <span>01 — 03</span>
            </div>
            <CareerArtwork />
          </Reveal>
        </section>
        <section className="cn-principles-strip">
          <span>
            MORE POSSIBILITY.
            <br />
            <strong>LESS FRICTION.</strong>
          </span>
          <p>Discover your opportunities</p>
          <i>✦</i>
          <p>Build your confidence</p>
          <i>✦</i>
          <p>Move forward, together</p>
        </section>
        <section id="features" className="cn-marketing-section">
          <Reveal className="cn-marketing-section-heading">
            <span className="cn-eyebrow">ROOM FOR YOUR AMBITION</span>
            <h2>
              Everything you need.
              <br />
              <em>Space to focus on what matters.</em>
            </h2>
            <p>
              Less time juggling tabs. More time building the future you want.
            </p>
          </Reveal>
          <div className="cn-feature-grid">
            {[
              [
                BriefcaseBusiness,
                "Opportunities that fit.",
                "Explore campus roles, review the details, and take the next step with confidence.",
              ],
              [
                FileText,
                "Your journey, organized.",
                "Keep applications, recruitment stages, and profile details together in one clear workspace.",
              ],
              [
                Code2,
                "A little sharper, every day.",
                "Practice in the coding studio, take assessments, and learn with shared resources.",
              ],
            ].map(([Icon, title, text], i) => (
              <Reveal className="cn-feature" delay={i * 0.06} key={title}>
                <span className="cn-feature-number">0{i + 1}</span>
                <span className="cn-feature-icon">
                  <Icon size={24} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </section>
        <section
          id="workspaces"
          className="cn-marketing-section cn-audience-section"
        >
          <Reveal className="cn-marketing-section-heading">
            <span className="cn-eyebrow">
              ONE PLATFORM. SHARED POSSIBILITIES.
            </span>
            <h2>
              Find your place.
              <br />
              <em>Make your next move.</em>
            </h2>
          </Reveal>
          <div className="cn-audience-grid">
            {audiences.map(
              ({ icon: Icon, label, title, text, to, color, cta }, i) => (
                <Reveal
                  key={to}
                  delay={i * 0.06}
                  className={`cn-audience-card ${color}`}
                >
                  <Icon size={29} strokeWidth={1.5} />
                  <span className="cn-eyebrow">{label}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link className="cn-text-link" to={to}>
                    {cta}
                    <ArrowUpRight size={17} />
                  </Link>
                </Reveal>
              ),
            )}
          </div>
        </section>
        <Reveal className="cn-marketing-cta">
          <span className="cn-eyebrow">YOUR FUTURE IS A WORK IN PROGRESS.</span>
          <h2>
            Let's make the next step
            <br />a good one.
          </h2>
          <Link to="/student/login" className="cn-button cn-button-light">
            Open your workspace <ArrowUpRight size={17} />
          </Link>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
