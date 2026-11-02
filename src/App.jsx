import React, { lazy, Suspense } from "react";
import NotFound from "./components/NotFound";
import PageErrorBoundary from "./components/PageErrorBoundary";
import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import WorkspaceNav from "./components/WorkspaceNav";
import { useLocation, Routes, Route } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import RequireSession from "./components/RequireSession";
import SessionWatcher from "./components/SessionWatcher";
import WorkspaceRedirect from "./components/WorkspaceRedirect";
import { getSession } from "./services/session";

// Pages
const Home = lazy(() => import("./pages/landingpage/Home"));

// 🎓 Student
const Student = lazy(() => import("./pages/student/Student"));
const StudentLogin = lazy(() => import("./pages/student/StudentLogin"));
const StudentSignup = lazy(() => import("./pages/student/StudentSignup"));
const StudentForgotPassword = lazy(
  () => import("./pages/student/StudentForgotPassword"),
);
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));

const StudentApplyJobs = lazy(() => import("./pages/student/StudentApplyJobs"));
const StudentTestPage = lazy(() => import("./pages/student/StudentTestPage"));
const StudentApplications = lazy(
  () => import("./pages/student/StudentApplications"),
);
const Resources = lazy(() => import("./pages/student/Resources"));
const StudentPractice = lazy(() => import("./pages/student/StudentPractice"));
const StudentCodingAssessments = lazy(
  () => import("./pages/student/StudentCodingAssessments"),
);
const StudentCodingExam = lazy(
  () => import("./pages/student/StudentCodingExam"),
);

// 🏫 TPO
const TPO = lazy(() => import("./pages/tpo/TPO"));
const TPOLogin = lazy(() => import("./pages/tpo/TpoLogin"));
const Tpohome = lazy(() => import("./pages/tpo/TPOHome"));
const TpoProfile = lazy(() => import("./pages/tpo/TPOProfile"));
const TPOStudents = lazy(() => import("./pages/tpo/TPOStudents"));
const TPORecruiters = lazy(() => import("./pages/tpo/TPORecruiters"));
const TPOCodingAssessmentForm = lazy(
  () => import("./pages/tpo/TPOCodingAssessmentForm"),
);

// 👨‍💼 Recruiter
const Recruiter = lazy(() => import("./pages/recruiter/Recruiter"));
const RecruiterLogin = lazy(() => import("./pages/recruiter/RecruiterLogin"));
const RecruiterDashboard = lazy(
  () => import("./pages/recruiter/RecruiterHome"),
);
const RecruiterProfile = lazy(
  () => import("./pages/recruiter/RecruiterProfile"),
);
const RecruiterJob = lazy(() => import("./pages/recruiter/RecruiterJob"));
const ApplicationsPage = lazy(
  () => import("./pages/recruiter/ApplicationsPage"),
);
const RecruitmentProcessPage = lazy(
  () => import("./pages/recruiter/RecruitmentProcessPage"),
);
const RecruiterCodingRoundResults = lazy(
  () => import("./pages/recruiter/RecruiterCodingRoundResults"),
);

// 🛠️ Admin
const Admin = lazy(() => import("./pages/admin/Admin"));
const AdminAccessForm = lazy(() => import("./pages/admin/AdminAccessForm"));
const AdminCreateUser = lazy(() => import("./pages/admin/AdminCreateUser"));

const App = () => {
  const location = useLocation();
  const path = location.pathname;
  const publicPaths = [
    "/",
    "/student",
    "/recruiter",
    "/tpo",
    "/student/login",
    "/student/signup",
    "/student/forgot-password",
    "/recruiter/login",
    "/tpo/login",
  ];
  const focusMode =
    path === "/student/practice" ||
    /\/test\/|\/coding-assessment\/\d/.test(path);
  const workspace =
    !publicPaths.includes(path) &&
    !focusMode &&
    /^(student|recruiter|tpo|admin)$/.test(path.split("/")[1]) &&
    getSession()?.role === path.split("/")[1];
  const role = path.split("/")[1];
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${path === "/" ? "Your next chapter" : role === "tpo" ? "Placement workspace" : role.charAt(0).toUpperCase() + role.slice(1)} · CareerNexus`;
  }, [path, role]);
  useEffect(() => {
    if (!location.hash) return;
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const observer = new MutationObserver(scroll);
    function scroll() {
      const target = document.getElementById(id);
      if (!target) return;
      observer.disconnect();
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
    observer.observe(document.getElementById("root"), {
      childList: true,
      subtree: true,
    });
    scroll();
    const timeout = setTimeout(() => observer.disconnect(), 5000);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [location.hash, path]);

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      <SessionWatcher />
      <div
        className={
          workspace ? "cn-workspace" : focusMode ? "cn-focus" : "cn-public"
        }
      >
        <a href="#main-content" className="cn-skip-link">
          Skip to content
        </a>
        {workspace && (
          <WorkspaceNav
            role={
              ["student", "recruiter", "tpo", "admin"].includes(role)
                ? role
                : "student"
            }
          />
        )}
        <div id="main-content" tabIndex={-1}>
          <PageErrorBoundary key={path}>
            <Suspense
              fallback={
                <div
                  className="cn-route-loading"
                  role="status"
                  aria-label="Loading your workspace"
                >
                  <span className="cn-route-spinner" />
                  <p>Getting your workspace ready…</p>
                </div>
              }
            >
              <Routes>
                {/* 🌐 Landing */}
                <Route path="/" element={<Home />} />

                {/* 🎓 Student */}
                <Route path="/student" element={<Student />} />
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/student/signup" element={<StudentSignup />} />
                <Route
                  path="/student/forgot-password"
                  element={<StudentForgotPassword />}
                />
                <Route
                  path="/student/:userId/home"
                  element={
                    <RequireSession role="student">
                      <StudentDashboard />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/:userId/profile"
                  element={
                    <RequireSession role="student">
                      <StudentProfile />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/profile"
                  element={<WorkspaceRedirect role="student" page="profile" />}
                />

                <Route
                  path="/student/:userId/apply-jobs"
                  element={
                    <RequireSession role="student">
                      <StudentApplyJobs />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/apply-jobs"
                  element={
                    <WorkspaceRedirect role="student" page="apply-jobs" />
                  }
                />
                <Route
                  path="/student/:userId/applications"
                  element={
                    <RequireSession role="student">
                      <StudentApplications />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/:userId/test/:assessmentId"
                  element={
                    <RequireSession role="student">
                      <StudentTestPage />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/resources"
                  element={
                    <RequireSession role="student">
                      <Resources />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/practice"
                  element={
                    <RequireSession role="student">
                      <StudentPractice />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/:userId/coding-assessments"
                  element={
                    <RequireSession role="student">
                      <StudentCodingAssessments />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/:userId/coding-assessment/:assessmentId"
                  element={
                    <RequireSession role="student">
                      <StudentCodingExam />
                    </RequireSession>
                  }
                />

                {/* 🏫 TPO */}
                <Route path="/tpo" element={<TPO />} />
                <Route path="/tpo/login" element={<TPOLogin />} />
                <Route
                  path="/tpo/:userId/home"
                  element={
                    <RequireSession role="tpo">
                      <Tpohome />
                    </RequireSession>
                  }
                />
                <Route
                  path="/tpo/:userId/profile"
                  element={
                    <RequireSession role="tpo">
                      <TpoProfile />
                    </RequireSession>
                  }
                />
                <Route
                  path="/tpo/:userId/students"
                  element={
                    <RequireSession role="tpo">
                      <TPOStudents />
                    </RequireSession>
                  }
                />
                <Route
                  path="/tpo/:userId/recruiters"
                  element={
                    <RequireSession role="tpo">
                      <TPORecruiters />
                    </RequireSession>
                  }
                />
                <Route
                  path="/tpo/:userId/coding-assessment/create"
                  element={
                    <RequireSession role="tpo">
                      <TPOCodingAssessmentForm />
                    </RequireSession>
                  }
                />

                {/* 👨‍💼 Recruiter */}
                <Route path="/recruiter" element={<Recruiter />} />
                <Route path="/recruiter/login" element={<RecruiterLogin />} />
                <Route
                  path="/recruiter/:userId/home"
                  element={
                    <RequireSession role="recruiter">
                      <RecruiterDashboard />
                    </RequireSession>
                  }
                />
                <Route
                  path="/recruiter/:userId/profile"
                  element={
                    <RequireSession role="recruiter">
                      <RecruiterProfile />
                    </RequireSession>
                  }
                />
                <Route
                  path="/recruiter/:userId/jobpostings"
                  element={
                    <RequireSession role="recruiter">
                      <RecruiterJob />
                    </RequireSession>
                  }
                />
                <Route
                  path="/recruiter/:userId/applications"
                  element={
                    <RequireSession role="recruiter">
                      <ApplicationsPage />
                    </RequireSession>
                  }
                />
                <Route
                  path="/recruiter/:userId/recruitment-process/:jobId"
                  element={
                    <RequireSession role="recruiter">
                      <RecruitmentProcessPage />
                    </RequireSession>
                  }
                />
                <Route
                  path="/recruiter/:userId/recruitment-process/:jobId/coding-round/:assessmentId"
                  element={
                    <RequireSession role="recruiter">
                      <RecruiterCodingRoundResults />
                    </RequireSession>
                  }
                />

                {/* 🛠️ Admin */}
                <Route
                  path="/admin"
                  element={
                    <RequireSession role="admin">
                      <Admin />
                    </RequireSession>
                  }
                />
                <Route
                  path="/admin/create-user"
                  element={
                    <RequireSession role="admin">
                      <AdminCreateUser />
                    </RequireSession>
                  }
                />
                <Route
                  path="/admin/AdminAccessForm"
                  element={
                    <RequireSession role="admin">
                      <AdminAccessForm />
                    </RequireSession>
                  }
                />
                <Route
                  path="/student/home"
                  element={<WorkspaceRedirect role="student" />}
                />
                <Route
                  path="/recruiter/profile"
                  element={
                    <WorkspaceRedirect role="recruiter" page="profile" />
                  }
                />
                <Route
                  path="/tpo/profile"
                  element={<WorkspaceRedirect role="tpo" page="profile" />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageErrorBoundary>
        </div>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
              padding: "16px",
              borderRadius: "12px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              iconTheme: {
                primary: "#ad552f",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  {t.type !== "loading" && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="ml-2 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
      </div>
    </MotionConfig>
  );
};

export default App;
