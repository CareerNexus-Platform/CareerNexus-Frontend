import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  BriefcaseBusiness,
  Users,
  ClipboardCheck,
  Building2,
  FileText,
  Plus,
  UserRound,
  ShieldCheck,
  RefreshCw,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import getUserId from "../services/getUserId";
import requestApi from "../services/request";
import { PageHeader, Reveal, Footer, StatCard, EmptyState } from "./ui";
export default function ManagementDashboard({ role }) {
  const id = getUserId();
  const base = `/${role}/${id}`;
  const [data, setData] = useState({
    profile: null,
    jobs: [],
    counts: [],
    recruiters: [],
    tests: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unavailable, setUnavailable] = useState([]);
  const [profileMissing, setProfileMissing] = useState(false);
  const load = useCallback(async () => {
    if (role === "admin") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    const endpoints =
      role === "recruiter"
        ? [
            "/recruiter/profile",
            "/jobs/recruiter",
            `/applications/counts/per-job/by-recruiter/${id}`,
          ]
        : ["/tpo/profile", "/jobs/recruiters/job", "/coding-exam/all"];
    const results = await Promise.allSettled(
      endpoints.map((endpoint) => requestApi.get(endpoint)),
    );
    const get = (index, fallback) =>
      results[index].status === "fulfilled"
        ? (results[index].value.data ?? fallback)
        : fallback;
    setUnavailable(results.map((result) => result.status === "rejected"));
    setData({
      profile: get(0, null),
      jobs: role === "recruiter" ? get(1, []) : [],
      counts: role === "recruiter" ? get(2, []) : [],
      recruiters: role === "tpo" ? get(1, []) : [],
      tests: role === "tpo" ? get(2, []) : [],
    });
    setProfileMissing(
      results[0].status === "rejected" &&
        results[0].reason.response?.status === 404,
    );
    setError(
      results.some(
        (result, index) =>
          result.status === "rejected" &&
          !(index === 0 && result.reason.response?.status === 404),
      ),
    );
    setLoading(false);
  }, [id, role]);
  useEffect(() => {
    load();
  }, [load]);
  const recruiter = role === "recruiter";
  const admin = role === "admin";
  const actions = recruiter
    ? [
        [
          BriefcaseBusiness,
          "Job postings",
          "Create opportunities. Keep your open roles up to date.",
          `${base}/jobpostings`,
          "Manage job postings",
        ],
        [
          FileText,
          "Candidate applications",
          "Follow your applicants through every recruitment stage.",
          `${base}/applications`,
          "Review applications",
        ],
        [
          UserRound,
          "Company profile",
          "Make a great first impression on your future hires.",
          `${base}/profile?page=update`,
          "Update your profile",
        ],
      ]
    : admin
      ? [
          [
            Plus,
            "Create a new user",
            "Give students, recruiters, and placement officers a place to start.",
            "/admin/create-user",
            "Create user",
          ],
          [
            ShieldCheck,
            "Workspace access",
            "Create an account and send the new user their sign-in details.",
            "/admin/AdminAccessForm",
            "Grant access",
          ],
          [
            BookOpen,
            "Explore the platform",
            "See how CareerNexus connects students, recruiters, and institutions.",
            "/",
            "Explore CareerNexus",
          ],
        ]
      : [
          [
            Users,
            "Student directory",
            "Find student profiles by department, year, and coding platform.",
            `${base}/students`,
            "Explore student profiles",
          ],
          [
            Building2,
            "Recruiter network",
            "Review campus recruiters, job openings, and candidate applications.",
            `${base}/recruiters`,
            "View recruiters",
          ],
          [
            ClipboardCheck,
            "Coding assessments",
            "Create practice tests that help your students build confidence.",
            `${base}/coding-assessment/create`,
            "Create an assessment",
          ],
        ];
  const mainTo = recruiter
    ? `${base}/jobpostings`
    : admin
      ? "/admin/create-user"
      : `${base}/coding-assessment/create`;
  const mainLabel = recruiter
    ? "Create an opportunity"
    : admin
      ? "Create a user"
      : "Create an assessment";
  const openJobs = data.jobs.filter(
    (job) =>
      !job.applicationDeadline ||
      new Date(job.applicationDeadline) >= new Date(),
  ).length;
  const totalApplications = data.counts.reduce(
    (sum, item) => sum + Number(item.applicationCount || 0),
    0,
  );
  return (
    <>
      <main className="cn-content cn-management-dashboard">
        {profileMissing && (
          <div className="cn-profile-setup">
            <div>
              <strong>Let's finish your workspace setup.</strong>
              <p>Add your profile details to get started.</p>
            </div>
            <Link
              className="cn-button cn-button-white"
              to={`${base}/profile?page=data`}
            >
              Set up profile
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
        <Reveal>
          <PageHeader
            eyebrow={
              admin
                ? "A WELL-CONNECTED COMMUNITY"
                : recruiter
                  ? "YOUR HIRING JOURNEY, IN FOCUS"
                  : "YOUR CAMPUS, CONNECTED"
            }
            title={
              admin
                ? "A space for everyone."
                : `Welcome back${data.profile?.firstName ? `, ${data.profile.firstName}` : ""}.`
            }
            description={
              admin
                ? "Help the right people find their place in CareerNexus."
                : recruiter
                  ? "Good people. Great possibilities. Let’s bring them together."
                  : "Connect ambition with opportunity, one student at a time."
            }
            action={
              <Link className="cn-button" to={mainTo}>
                <Plus size={15} />
                {mainLabel}
              </Link>
            }
          />
        </Reveal>
        {error && (
          <div className="cn-inline-notice" role="status">
            Some workspace updates are unavailable.
            <button onClick={load}>
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}
        {!admin && (
          <Reveal className="cn-stats-grid cn-three-stats">
            {recruiter ? (
              <>
                <StatCard
                  label="Job postings"
                  icon={BriefcaseBusiness}
                  value={unavailable[1] ? "—" : data.jobs.length}
                  caption="Opportunities you've created"
                  loading={loading}
                />
                <StatCard
                  label="Open opportunities"
                  icon={Building2}
                  value={unavailable[1] ? "—" : openJobs}
                  caption="Roles with upcoming deadlines"
                  loading={loading}
                  tone="blue"
                />
                <StatCard
                  label="Applications received"
                  icon={Users}
                  value={unavailable[2] ? "—" : totalApplications}
                  caption="Talent ready to take the next step"
                  loading={loading}
                  tone="amber"
                />
              </>
            ) : (
              <>
                <StatCard
                  label="Campus recruiters"
                  icon={Building2}
                  value={unavailable[1] ? "—" : data.recruiters.length}
                  caption="Your connected recruiter network"
                  loading={loading}
                />
                <StatCard
                  label="Published assessments"
                  icon={ClipboardCheck}
                  value={unavailable[2] ? "—" : data.tests.length}
                  caption="Practice and recruitment assessments"
                  loading={loading}
                  tone="blue"
                />
                <StatCard
                  label="Student directory"
                  icon={GraduationCap}
                  value="Explore"
                  caption="Filter profiles by year and department"
                  loading={loading}
                  tone="amber"
                />
              </>
            )}
          </Reveal>
        )}
        <Reveal>
          <div className="cn-section-heading cn-hub-heading">
            <div>
              <span className="cn-eyebrow">A CLEAR PATH FORWARD</span>
              <h2>
                {admin ? "Your administration hub" : "Make your next move"}
              </h2>
            </div>
            <span className="cn-hub-caption">
              Everything you need, right here.
            </span>
          </div>
        </Reveal>
        <div className="cn-management-grid">
          {actions.map(([Icon, title, description, to, cta], i) => (
            <Reveal
              className="cn-panel cn-management-card"
              key={to}
              delay={i * 0.05}
            >
              <span
                className={`cn-icon-tile ${i === 1 ? "amber" : i === 2 ? "blue" : "teal"}`}
              >
                <Icon size={22} />
              </span>
              <h2>{title}</h2>
              <p>{description}</p>
              <Link to={to} className="cn-text-link">
                {cta}
                <ArrowUpRight size={16} />
              </Link>
            </Reveal>
          ))}
        </div>
        {!admin && (
          <Reveal className="cn-panel">
            <div className="cn-section-heading">
              <div>
                <span className="cn-eyebrow">KEEP YOUR COMMUNITY MOVING</span>
                <h2>
                  {recruiter
                    ? "Your recent job postings"
                    : "Your recruiter network"}
                </h2>
              </div>
              <Link
                className="cn-text-link"
                to={recruiter ? `${base}/jobpostings` : `${base}/recruiters`}
              >
                View all
                <ArrowUpRight size={16} />
              </Link>
            </div>
            {loading ? (
              <div className="cn-loading-list">
                <div className="cn-skeleton" />
                <div className="cn-skeleton" />
              </div>
            ) : recruiter ? (
              data.jobs.length ? (
                <div className="cn-opportunity-list">
                  {[...data.jobs]
                    .reverse()
                    .slice(0, 4)
                    .map((job) => (
                      <Link
                        key={job.id}
                        to={`${base}/jobpostings`}
                        className="cn-opportunity"
                      >
                        <span className="cn-company-initial">
                          <BriefcaseBusiness size={20} />
                        </span>
                        <div className="cn-opportunity-info">
                          <h3>{job.jobTitle}</h3>
                          <p>{job.companyName}</p>
                        </div>
                        <span className="cn-badge">
                          {job.applicationDeadline &&
                          new Date(job.applicationDeadline) < new Date()
                            ? "Closed"
                            : "Open"}
                        </span>
                        <ArrowUpRight size={16} />
                      </Link>
                    ))}
                </div>
              ) : (
                <EmptyState
                  icon={BriefcaseBusiness}
                  title="Your next great hire starts with a role."
                  description="Create your first job posting and invite emerging talent to take their next step."
                  to={`${base}/jobpostings`}
                  action="Create a posting"
                />
              )
            ) : data.recruiters.length ? (
              <div className="cn-company-grid">
                {data.recruiters.map((person) => (
                  <Link
                    to={`${base}/recruiters`}
                    className="cn-company-chip"
                    key={person.userId || person.id}
                  >
                    <Building2 size={18} />
                    <strong>
                      {person.company || person.name || "Recruiter"}
                    </strong>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title="A growing network starts here."
                description="Recruiters and their campus roles will appear as they join your community."
              />
            )}
          </Reveal>
        )}
      </main>
      <Footer />
    </>
  );
}
