import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  BriefcaseBusiness,
  FileText,
  Code2,
  Users,
  ClipboardCheck,
  Building2,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import PublicNav from "./PublicNav";
import { CareerArtwork, Footer, Reveal } from "./ui";
const content = {
  student: {
    label: "FOR THE NEXT GENERATION",
    title: (
      <>
        Your potential.
        <br />A world of <em>possibility.</em>
      </>
    ),
    description:
      "Your placement journey deserves a little clarity. Discover roles, prepare with purpose, and keep every next step in view.",
    cta: "Enter student workspace",
    extra: "Create a student account",
    features: [
      [
        BriefcaseBusiness,
        "Find your fit",
        "Explore campus openings and apply with your latest resume.",
      ],
      [
        FileText,
        "Stay in the loop",
        "Follow your applications and recruitment rounds in one place.",
      ],
      [
        Code2,
        "Make progress daily",
        "Practice coding, take assessments, and explore learning resources.",
      ],
    ],
  },
  recruiter: {
    label: "FOR TEAMS BUILDING WHAT’S NEXT",
    title: (
      <>
        Great teams.
        <br />
        Even greater <em>possibilities.</em>
      </>
    ),
    description:
      "Connect with emerging talent. Manage your roles, review applicants, and make every step of campus recruitment more thoughtful.",
    cta: "Enter recruiter workspace",
    features: [
      [
        BriefcaseBusiness,
        "Create opportunities",
        "Publish campus openings and keep your job requirements current.",
      ],
      [
        Users,
        "Discover your next hire",
        "Review applications and follow candidate progress.",
      ],
      [
        ClipboardCheck,
        "A clearer hiring journey",
        "Organize recruitment stages, assessments, and candidate feedback.",
      ],
    ],
  },
  tpo: {
    label: "FOR THE PEOPLE CONNECTING IT ALL",
    title: (
      <>
        One campus.
        <br />
        Countless <em>bright futures.</em>
      </>
    ),
    description:
      "Give your placement community a shared home. Connect recruiters and students, organize assessments, and keep opportunities moving.",
    cta: "Enter placement workspace",
    features: [
      [
        GraduationCap,
        "Support every student",
        "Find student profiles and connect skills with opportunities.",
      ],
      [
        Building2,
        "Build your network",
        "Keep campus recruiters and their openings in view.",
      ],
      [
        ClipboardCheck,
        "Prepare for what’s next",
        "Create coding assessments and help students put their skills to work.",
      ],
    ],
  },
};
export default function PortalLanding({ role }) {
  const data = content[role];
  return (
    <div className="cn-marketing">
      <PublicNav />
      <main>
        <section className="cn-landing-hero cn-portal-hero">
          <Reveal className="cn-hero-copy">
            <span className="cn-marketing-eyebrow">
              <span />
              {data.label}
            </span>
            <h1>{data.title}</h1>
            <p>{data.description}</p>
            <div className="cn-hero-actions">
              <Link to={`/${role}/login`} className="cn-button">
                {data.cta}
                <ArrowUpRight size={18} />
              </Link>
              {role === "student" && (
                <Link to="/student/signup" className="cn-quiet-link">
                  Create an account
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
            <div className="cn-hero-footnote">
              <span>
                <Check size={13} />
                Your journey, in one place
              </span>
            </div>
          </Reveal>
          <Reveal className="cn-portal-art">
            <span className="cn-eyebrow">BUILT FOR YOUR NEXT CHAPTER</span>
            <CareerArtwork />
            <div className="cn-portal-note">
              <BookOpen size={22} />
              <p>
                Room to learn.
                <br />
                <strong>Space to grow.</strong>
              </p>
              <ArrowUpRight size={23} />
            </div>
          </Reveal>
        </section>
        <section className="cn-marketing-section">
          <Reveal className="cn-marketing-section-heading">
            <span className="cn-eyebrow">CLARITY AT EVERY STEP</span>
            <h2>
              A workspace that
              <br />
              <em>works around you.</em>
            </h2>
          </Reveal>
          <div className="cn-feature-grid">
            {data.features.map(([Icon, title, description], index) => (
              <Reveal className="cn-feature" delay={index * 0.06} key={title}>
                <span className="cn-feature-number">0{index + 1}</span>
                <span className="cn-feature-icon">
                  <Icon size={25} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </Reveal>
            ))}
          </div>
        </section>
        <Reveal className="cn-marketing-cta">
          <span className="cn-eyebrow">YOUR NEXT CHAPTER IS WAITING.</span>
          <h2>Let's move forward.</h2>
          <Link className="cn-button cn-button-light" to={`/${role}/login`}>
            Open your workspace
            <ArrowUpRight size={18} />
          </Link>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
