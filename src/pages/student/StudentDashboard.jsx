import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  Trophy,
  Clock3,
  Code2,
  BookOpen,
  ClipboardCheck,
  MapPin,
  Building2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import requestApi from "../../services/request";
import { isPastDeadline } from "../../services/jobs";
import {
  EmptyState,
  Footer,
  PageHeader,
  Reveal,
  StatCard,
} from "../../components/ui";

function locations(value) {
  if (Array.isArray(value)) return value.join(", ");
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(", ") : value;
  } catch {
    return value || "Location to be announced";
  }
}
export default function StudentDashboard() {
  const { userId } = useParams();
  const [data, setData] = useState({
    jobs: [],
    applications: [],
    companies: [],
    profile: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unavailable, setUnavailable] = useState([]);
  const [profileMissing, setProfileMissing] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const results = await Promise.allSettled([
      requestApi.get("/jobs/latest"),
      requestApi.get("/applications/my-applications"),
      requestApi.get("/student/companies-visited"),
      requestApi.get("/student/profile"),
    ]);
    const get = (index, fallback) =>
      results[index].status === "fulfilled"
        ? results[index].value.data
        : fallback;
    setUnavailable(results.map((result) => result.status === "rejected"));
    setData({
      jobs: (get(0, []) || []).filter(
        (job) => !isPastDeadline(job.applicationDeadline),
      ),
      applications: get(1, []) || [],
      companies: get(2, []) || [],
      profile: get(3, null),
    });
    setProfileMissing(
      results[3].status === "rejected" &&
        results[3].reason.response?.status === 404,
    );
    setError(
      results.some(
        (result, index) =>
          result.status === "rejected" &&
          !(index === 3 && result.reason.response?.status === 404),
      ),
    );
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const base = `/student/${userId}`;
  const recent = [...data.applications]
    .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
    .slice(0, 4);
  const offers = data.applications.filter((app) =>
    ["ACCEPTED", "SELECTED"].includes(app.status?.toUpperCase()),
  ).length;
  const pending = data.applications.filter(
    (app) =>
      !["ACCEPTED", "SELECTED", "REJECTED"].includes(app.status?.toUpperCase()),
  ).length;
  const name = data.profile?.firstName;
  return (
    <>
      <main className="cn-dashboard cn-content">
        <Reveal>
          <PageHeader
            eyebrow="YOUR CAREER, IN FOCUS"
            title={`Welcome back${name ? `, ${name}` : ""}.`}
            description="Review your applications, explore open roles, and plan your next step."
            action={
              <Link to={`${base}/apply-jobs`} className="cn-button">
                Find opportunities <ArrowUpRight size={16} />
              </Link>
            }
          />
        </Reveal>
        {profileMissing && (
          <div className="cn-profile-setup">
            <div>
              <strong>Your next step: complete your profile</strong>
              <p>Add your details once, then use them for every application.</p>
            </div>
            <Link
              to={`${base}/profile?page=data`}
              className="cn-button cn-button-white"
            >
              Set up profile
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
        {error && (
          <div className="cn-inline-notice" role="status">
            Some updates couldn't be loaded. Your workspace is still available.
            <button onClick={load}>
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}
        <Reveal delay={0.05} className="cn-stats-grid">
          <StatCard
            icon={FileText}
            label="Applications sent"
            value={unavailable[1] ? "—" : data.applications.length}
            caption="Every application is a step forward"
            loading={loading}
          />
          <StatCard
            icon={Clock3}
            label="In progress"
            value={unavailable[1] ? "—" : pending}
            caption="Applications awaiting an update"
            tone="amber"
            loading={loading}
          />
          <StatCard
            icon={Trophy}
            label="Offers & selections"
            value={unavailable[1] ? "—" : offers}
            caption="Your hard work, recognized"
            tone="blue"
            loading={loading}
          />
          <StatCard
            icon={Building2}
            label="Campus recruiters"
            value={unavailable[2] ? "—" : data.companies.length}
            caption="Companies in your campus network"
            tone="rose"
            loading={loading}
          />
        </Reveal>
        <div className="cn-dashboard-columns">
          <div className="cn-dashboard-primary">
            <Reveal className="cn-panel">
              <div className="cn-section-heading">
                <div>
                  <span className="cn-eyebrow">DISCOVER WHAT'S NEXT</span>
                  <h2>Latest opportunities</h2>
                </div>
                <Link className="cn-text-link" to={`${base}/apply-jobs`}>
                  View all <ArrowUpRight size={16} />
                </Link>
              </div>
              {loading ? (
                <div
                  className="cn-loading-list"
                  aria-label="Loading opportunities"
                >
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="cn-skeleton" />
                  ))}
                </div>
              ) : data.jobs.length ? (
                <div className="cn-opportunity-list">
                  {data.jobs.slice(0, 3).map((job) => (
                    <Link
                      key={job.id}
                      to={`${base}/apply-jobs?jobId=${job.id}`}
                      className="cn-opportunity"
                    >
                      <span className="cn-company-initial">
                        {job.companyName?.charAt(0) || (
                          <BriefcaseBusiness size={20} />
                        )}
                      </span>
                      <div className="cn-opportunity-info">
                        <h3>{job.jobTitle}</h3>
                        <p>{job.companyName}</p>
                        <span>
                          <MapPin size={12} />
                          {locations(job.locations)}
                        </span>
                      </div>
                      <div className="cn-opportunity-end">
                        <strong>{job.salaryPackage || "View details"}</strong>
                        <span>
                          Explore role <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BriefcaseBusiness}
                  title={
                    unavailable[0]
                      ? "Opportunities are temporarily unavailable"
                      : "Your next opportunity is on its way"
                  }
                  description="New campus openings will appear here. In the meantime, make sure your profile is ready."
                  to={`${base}/profile?page=update`}
                  action="Update your profile"
                />
              )}
            </Reveal>
            <Reveal className="cn-panel">
              <div className="cn-section-heading">
                <div>
                  <span className="cn-eyebrow">KEEP THINGS MOVING</span>
                  <h2>Recent applications</h2>
                </div>
                <Link className="cn-text-link" to={`${base}/applications`}>
                  View all <ArrowUpRight size={16} />
                </Link>
              </div>
              {loading ? (
                <div className="cn-loading-list">
                  <div className="cn-skeleton" />
                </div>
              ) : recent.length ? (
                <div className="cn-application-list">
                  {recent.map((app) => (
                    <Link
                      to={`${base}/applications`}
                      className="cn-application-row"
                      key={app.id}
                    >
                      <span className="cn-company-initial small">
                        {app.jobPost?.companyName?.charAt(0) || "C"}
                      </span>
                      <div>
                        <h3>{app.jobPost?.jobTitle || "Job application"}</h3>
                        <p>
                          {app.jobPost?.companyName} ·{" "}
                          {app.applicationDate
                            ? new Date(app.applicationDate).toLocaleDateString(
                                "en",
                                { month: "short", day: "numeric" },
                              )
                            : "Date unavailable"}
                        </p>
                      </div>
                      <span
                        className={`cn-badge ${["ACCEPTED", "SELECTED"].includes(app.status) ? "success" : app.status === "REJECTED" ? "danger" : "pending"}`}
                      >
                        {app.status?.replaceAll("_", " ") || "Pending"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title={
                    unavailable[1]
                      ? "Application updates are unavailable"
                      : "A clean slate. So much potential."
                  }
                  description={
                    unavailable[1]
                      ? "We couldn’t load your application history. Use Try again above to refresh your updates."
                      : "Once you apply to a role, you can follow every update right here."
                  }
                  to={`${base}/apply-jobs`}
                  action="Find your first opportunity"
                />
              )}
            </Reveal>
          </div>
          <div className="cn-dashboard-secondary">
            <Reveal className="cn-panel cn-prepare-panel">
              <div className="cn-section-heading">
                <h2>Build your skills</h2>
                <Sparkles size={19} />
              </div>
              <p>Practice coding, take assessments, and keep learning.</p>
              {[
                [
                  Code2,
                  "Coding studio",
                  "Practice at your own pace",
                  "/student/practice",
                  "teal",
                ],
                [
                  ClipboardCheck,
                  "Assessments",
                  "Put your skills to the test",
                  `${base}/coding-assessments`,
                  "amber",
                ],
                [
                  BookOpen,
                  "Resource library",
                  "Learn something new today",
                  "/student/resources",
                  "blue",
                ],
              ].map(([Icon, title, desc, to, tone]) => (
                <Link key={to} className="cn-quick-link" to={to}>
                  <span className={`cn-icon-tile ${tone}`}>
                    <Icon size={20} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </Reveal>
            <Reveal className="cn-profile-prompt">
              <span className="cn-eyebrow">LET YOUR POTENTIAL SHOW</span>
              <div className="cn-profile-art">
                <span />
                <span />
                <span />
                <UserCard />
              </div>
              <h2>
                Your story deserves
                <br />a great first impression.
              </h2>
              <p>
                Keep your skills, projects, and resume up to date. Help the
                right opportunity find you.
              </p>
              <Link className="cn-text-link" to={`${base}/profile?page=update`}>
                Review your profile <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </div>
        <Reveal className="cn-panel cn-network-panel">
          <div className="cn-section-heading">
            <div>
              <span className="cn-eyebrow">CONNECTIONS THAT COUNT</span>
              <h2>Your campus network</h2>
            </div>
            <span className="cn-badge">{data.companies.length} recruiters</span>
          </div>
          {data.companies.length ? (
            <div className="cn-company-grid">
              {data.companies.slice(0, 8).map((company) => (
                <div className="cn-company-chip" key={company.userId}>
                  <Building2 size={18} />
                  <strong>{company.company}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="cn-muted">
              Your campus recruiters will appear here as they join the placement
              network.
            </p>
          )}
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
function UserCard() {
  return (
    <div className="cn-mini-profile">
      <span>YOU</span>
      <i />
      <i />
      <b>Ready for what's next ↗</b>
    </div>
  );
}
