// src/pages/student/StudentApplyJobs.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaBookmark,
  FaRegBookmark,
  FaBuilding,
  FaBolt,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaWallet,
  FaTasks,
} from "react-icons/fa";
import { LuPenLine } from "react-icons/lu";
import { motion as Motion, AnimatePresence } from "framer-motion";
import NavbarStudentDashboard from "../../components/NavbarStudentDashboard";
import QuickApplyModal from "./QuickApplyModal";
import requestApi from "../../services/request";
import toast from "react-hot-toast";
import getUserId from "../../services/getUserId";
import { useLocation } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { PageHeader } from "../../components/ui";
import useDialog from "../../hooks/useDialog";
import { isPastDeadline } from "../../services/jobs";

const StudentApplyJobs = () => {
  // ------------------ State Setup ------------------
  const [selectedTab, setSelectedTab] = useState("All opportunities");
  const [openOnly, setOpenOnly] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobRounds, setJobRounds] = useState([]);
  const [isLoadingRounds, setIsLoadingRounds] = useState(false);
  const [filters, setFilters] = useState({ location: "", role: "" });
  const [tempPrefs, setTempPrefs] = useState({ location: "", role: "" });
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const preferencesRef = useDialog(isPrefModalOpen, () =>
    setIsPrefModalOpen(false),
  );
  const [showApplyModal, setShowApplyModal] = useState(false);
  const userId = getUserId();
  const location = useLocation();

  const parseLocation = (loc) => {
    if (Array.isArray(loc)) return loc.join(", ");
    try {
      const parsed = JSON.parse(loc);
      return Array.isArray(parsed) ? parsed.join(", ") : String(parsed || "");
    } catch {
      return loc || "N/A";
    }
  };

  useEffect(() => {
    let prefs;
    try {
      prefs = JSON.parse(localStorage.getItem("jobPreferences"));
    } catch {
      prefs = null;
    }
    if (prefs) setFilters(prefs);

    const queryParams = new URLSearchParams(location.search);
    const jobIdFromQuery = queryParams.get("jobId");
    const shouldAutoApply = queryParams.get("apply") === "true";

    const fetchJobs = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const res = await requestApi.get(`/jobs/all`);

        const jobsWithSaved = res.data.map((job) => ({
          job_title: job.jobTitle,
          company_name: job.companyName,
          job_description: job.jobDescription,
          recruitment_process: job.recruitmentProcess,
          salary_package: job.salaryPackage,
          location: job.locations,
          application_deadline: job.applicationDeadline?.time
            ? new Date(job.applicationDeadline.time).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )
            : job.applicationDeadline,
          closed: isPastDeadline(job.applicationDeadline),
          id: job.id,
          saved: (() => {
            try {
              return JSON.parse(
                localStorage.getItem(`savedJobs_${userId}`) || "[]",
              ).includes(job.id);
            } catch {
              return false;
            }
          })(),
          applied: false,
        }));

        setJobs(jobsWithSaved);

        // 🔥 Auto select and open modal
        if (jobIdFromQuery) {
          const matchedJob = jobsWithSaved.find(
            (job) => job.id.toString() === jobIdFromQuery,
          );

          if (matchedJob) {
            setSelectedJob(matchedJob);

            if (shouldAutoApply && !matchedJob.closed) {
              setShowApplyModal(true);
            }
          }
        } else {
          setSelectedJob(jobsWithSaved[0]);
        }
      } catch {
        setFetchError(true);
        toast.error("Failed to fetch jobs", { id: "fetch-jobs-error" });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [location.search, refreshKey, userId]);

  useEffect(() => {
    if (isPrefModalOpen) {
      setTempPrefs(filters);
    }
  }, [isPrefModalOpen, filters]);

  // Fetch rounds for the selected job
  useEffect(() => {
    const fetchJobRounds = async () => {
      if (!selectedJob?.id) return;
      setIsLoadingRounds(true);
      try {
        const res = await requestApi.get(`/exam/student/${selectedJob.id}`);
        setJobRounds(res.data || []);
      } catch (err) {
        console.error("Failed to fetch rounds:", err);
        setJobRounds([]);
      } finally {
        setIsLoadingRounds(false);
      }
    };
    fetchJobRounds();
  }, [selectedJob]);

  // ------------------ Save/Unsave Job ------------------
  const toggleSave = (id) => {
    const updated = jobs.map((job) =>
      job.id === id ? { ...job, saved: !job.saved } : job,
    );
    setJobs(updated);
    localStorage.setItem("jobs", JSON.stringify(updated));
    localStorage.setItem(
      `savedJobs_${userId}`,
      JSON.stringify(updated.filter((job) => job.saved).map((job) => job.id)),
    );
  };

  // ------------------ Filtered Jobs ------------------
  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const jobLoc = parseLocation(job.location);
        return (
          `${job.job_title} ${job.company_name} ${jobLoc}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (filters.location ? jobLoc.includes(filters.location) : true) &&
          (filters.role ? job.job_title === filters.role : true) &&
          (selectedTab === "Saved" ? job.saved : true) &&
          (!openOnly || !job.closed)
        );
      }),
    [jobs, filters, selectedTab, search, openOnly],
  );

  useEffect(() => {
    if (selectedJob && !filteredJobs.some((job) => job.id === selectedJob.id))
      setSelectedJob(filteredJobs[0] || null);
    else if (!selectedJob && filteredJobs.length)
      setSelectedJob(filteredJobs[0]);
  }, [filteredJobs, selectedJob]);

  return (
    <div className="cn-data-page flex flex-col min-h-screen bg-gradient-to-br from-canvas to-canvas font-poppins relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* ------------------ Navbar ------------------ */}
      <NavbarStudentDashboard />

      {/* ------------------ Main Container ------------------ */}
      <Motion.div
        className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pt-28 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* ------------------ Header ------------------ */}
          <PageHeader
            eyebrow="FIND YOUR NEXT CHAPTER"
            title="Opportunities for you"
            description="Explore your options. Find a role that feels right."
            action={
              <button
                onClick={() => setIsPrefModalOpen(true)}
                className="cn-button cn-button-white"
              >
                <LuPenLine size={16} />
                Preferences
              </button>
            }
          />

          <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(65, 45, 32,0.05)]">
            {/* ------------------ Tabs ------------------ */}
            <div className="flex gap-6 border-b border-brand-100 mb-8 pb-1">
              {["All opportunities", "Saved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`pb-3 font-semibold text-sm sm:text-base relative transition-colors ${
                    selectedTab === tab ||
                    (tab === "All opportunities" &&
                      selectedTab === "Recommended")
                      ? "text-brand-700"
                      : "text-muted hover:text-brand-500"
                  }`}
                >
                  {tab}
                  {(selectedTab === tab ||
                    (tab === "All opportunities" &&
                      selectedTab === "Recommended")) && (
                    <Motion.div
                      layoutId="tabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="cn-jobs-search">
              <Search size={17} />
              <input
                aria-label="Search opportunities"
                placeholder="Search by role, company, or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span>
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "role" : "roles"}
              </span>
            </div>
            <label className="cn-job-availability">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(event) => setOpenOnly(event.target.checked)}
              />
              Open roles only
              <span>Hide roles whose application deadline has passed</span>
            </label>
            {fetchError && (
              <div className="cn-inline-notice" role="alert">
                We couldn't load opportunities.
                <button onClick={() => setRefreshKey((key) => key + 1)}>
                  <RefreshCw size={14} />
                  Try again
                </button>
              </div>
            )}
            {/* ------------------ Content Grid ------------------ */}
            <div className="cn-jobs-grid grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* ------------------ Job List ------------------ */}
              <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
                <AnimatePresence>
                  {loading ? (
                    <div
                      className="cn-loading-list"
                      role="status"
                      aria-label="Loading opportunities"
                    >
                      {[1, 2, 3].map((i) => (
                        <div className="cn-skeleton" key={i} />
                      ))}
                    </div>
                  ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                      <Motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(index, 5) * 0.04 }}
                        onClick={() => setSelectedJob(job)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${job.job_title} at ${job.company_name}`}
                        aria-pressed={selectedJob?.id === job.id}
                        onKeyDown={(e) => {
                          if (
                            e.target === e.currentTarget &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            setSelectedJob(job);
                          }
                        }}
                        className={`group cursor-pointer bg-white/80 backdrop-blur border p-5 rounded-2xl flex gap-4 items-start shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${
                          selectedJob?.id === job.id
                            ? "border-brand-400 shadow-[0_4px_20px_rgba(65, 45, 32,0.15)] ring-1 ring-brand-200"
                            : "border-brand-100 hover:border-brand-300"
                        }`}
                      >
                        {selectedJob?.id === job.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>
                        )}
                        <div className="bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 rounded-xl p-3 shadow-sm border border-brand-100 group-hover:translate-y-[-1px] transition-transform">
                          <FaBuilding size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-ink text-base mb-1 group-hover:text-brand-700 transition-colors line-clamp-1">
                            {job.job_title}
                          </h3>
                          <p className="text-sm font-medium text-muted mb-2">
                            {job.company_name}
                          </p>

                          <div className="flex flex-wrap gap-2 text-xs font-medium">
                            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                              <FaMapMarkerAlt className="text-gray-400" />{" "}
                              {parseLocation(job.location)}
                            </span>
                            <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md">
                              <FaCalendarAlt className="text-red-400" />{" "}
                              {job.application_deadline}
                            </span>
                          </div>
                        </div>

                        <button
                          aria-label={
                            job.saved
                              ? `Unsave ${job.job_title}`
                              : `Save ${job.job_title}`
                          }
                          aria-pressed={job.saved}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(job.id);
                          }}
                          className="p-2 rounded-full hover:bg-brand-50 transition-colors shrink-0"
                        >
                          {job.saved ? (
                            <FaBookmark className="text-brand-600 text-lg" />
                          ) : (
                            <FaRegBookmark className="text-gray-300 hover:text-brand-500 text-lg" />
                          )}
                        </button>
                      </Motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-white/60 border border-dashed border-brand-200 rounded-2xl">
                      <FaBuilding className="mx-auto text-4xl text-brand-200 mb-3" />
                      <h3 className="text-lg font-bold text-gray-700 mb-1">
                        No Jobs Found
                      </h3>
                      <p className="text-sm text-gray-500">
                        Try adjusting your preferences.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* ------------------ Job Details Panel ------------------ */}
              <div className="lg:col-span-7">
                {selectedJob ? (
                  <Motion.div
                    key={selectedJob.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgba(65, 45, 32,0.08)] border border-brand-100 overflow-y-auto max-h-[70vh] scrollbar-hide relative"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="flex flex-wrap gap-6 items-start justify-between mb-8 pb-6 border-b border-gray-100 relative z-10">
                      <div className="flex gap-5 items-center">
                        <div className="bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 rounded-2xl p-4 shadow-sm border border-brand-200">
                          <FaBuilding size={36} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-extrabold text-ink mb-1">
                            {selectedJob.job_title}
                          </h3>
                          <p className="text-lg font-medium text-brand-600">
                            {selectedJob.company_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                            Job ID: {selectedJob.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {selectedJob.closed ? (
                          <span className="cn-badge danger">
                            Applications closed
                          </span>
                        ) : selectedJob.applied ? (
                          <button
                            disabled
                            className="bg-brand-50 text-brand-600 border border-brand-200 py-2.5 px-6 rounded-xl font-bold flex items-center gap-2 shadow-sm cursor-not-allowed"
                          >
                            ✅ Successfully Applied
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowApplyModal(true)}
                            className="bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 text-white py-2.5 px-6 rounded-xl font-bold flex items-center gap-2 shadow-[0_4px_15px_rgba(65, 45, 32,0.3)] hover:shadow-[0_6px_20px_rgba(65, 45, 32,0.4)] transition-all transform hover:-translate-y-0.5"
                          >
                            <FaBolt /> Apply for this role
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="mt-0.5 text-brand-500">
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            Location
                          </h4>
                          <p className="text-sm font-semibold text-ink mt-0.5">
                            {parseLocation(selectedJob.location)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="mt-0.5 text-brand-500">
                          <FaWallet />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            Salary Package
                          </h4>
                          <p className="text-sm font-semibold text-ink mt-0.5">
                            {selectedJob.salary_package}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="mt-0.5 text-red-400">
                          <FaCalendarAlt />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            Apply Before
                          </h4>
                          <p className="text-sm font-semibold text-ink mt-0.5">
                            {selectedJob.application_deadline}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="mt-0.5 text-brand-500">
                          <FaTasks />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            Recruitment Process
                          </h4>
                          <p className="text-sm font-semibold text-ink mt-0.5">
                            {selectedJob.recruitment_process}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-3">
                      <h4 className="font-extrabold text-ink text-lg flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-brand-500 rounded-full inline-block"></span>
                        Job Description
                      </h4>
                      <p className="text-muted text-sm leading-relaxed bg-brand-50/30 p-5 rounded-2xl border border-brand-100/50 whitespace-pre-line">
                        {selectedJob.job_description}
                      </p>
                      <div className="cn-rounds-preview">
                        <h4>Recruitment stages</h4>
                        {isLoadingRounds ? (
                          <p role="status">Loading recruitment stages…</p>
                        ) : jobRounds.length ? (
                          <ol>
                            {jobRounds.map((round, index) => (
                              <li key={round.id || index}>
                                <span>{index + 1}</span>
                                <div>
                                  <strong>
                                    {round.roundName ||
                                      round.assessmentName ||
                                      "Assessment"}
                                  </strong>
                                  {round.startTime && (
                                    <small>
                                      {new Date(
                                        round.startTime,
                                      ).toLocaleString()}
                                    </small>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p>
                            The recruiter will share assessment details when
                            stages are scheduled.
                          </p>
                        )}
                      </div>
                    </div>
                  </Motion.div>
                ) : (
                  <div className="h-full bg-white/40 border border-dashed border-brand-200 rounded-3xl flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                      <FaBuilding className="text-3xl text-brand-400" />
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">
                      Select a Job Listing
                    </h3>
                    <p className="text-muted">
                      Click on any job from the list to view detailed
                      information and apply.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Motion.div>

      {/* ------------------ Preferences Modal ------------------ */}
      <AnimatePresence>
        {isPrefModalOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <Motion.div
              ref={preferencesRef}
              role="dialog"
              aria-modal="true"
              aria-label="Job preferences"
              tabIndex={-1}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-brand-600 to-brand-600 p-5 pb-8 relative">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Set Job Preferences
                </h3>
                <p className="text-brand-100 text-sm mt-1">
                  Filter your job feed based on your interests.
                </p>
              </div>

              <div className="p-6 pt-0 relative -mt-4 bg-white rounded-t-[2rem]">
                <div className="space-y-5 pt-6">
                  {["location", "role"].map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-bold text-ink mb-2 capitalize">
                        {key === "role" ? "Preferred Role" : `Preferred ${key}`}
                      </label>
                      <select
                        aria-label={String(key).replaceAll("_", " ")}
                        name={key}
                        value={tempPrefs[key]}
                        onChange={(e) =>
                          setTempPrefs((prev) => ({
                            ...prev,
                            [e.target.name]: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all outline-none text-muted"
                      >
                        <option value="">Any</option>
                        {[
                          ...new Set(
                            jobs.flatMap((j) =>
                              key === "role"
                                ? [j.job_title]
                                : (() => {
                                    try {
                                      const parsed = JSON.parse(j.location);
                                      return Array.isArray(parsed)
                                        ? parsed
                                        : [parsed];
                                    } catch {
                                      return Array.isArray(j.location)
                                        ? j.location
                                        : [j.location];
                                    }
                                  })(),
                            ),
                          ),
                        ]
                          .filter(Boolean)
                          .map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
                  <button
                    onClick={() => setIsPrefModalOpen(false)}
                    className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setFilters(tempPrefs);
                      localStorage.setItem(
                        "jobPreferences",
                        JSON.stringify(tempPrefs),
                      );
                      setIsPrefModalOpen(false);
                      toast.success("Preferences updated successfully!", {
                        id: "prefs-updated",
                      });
                    }}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ------------------ Apply Modal ------------------ */}
      <AnimatePresence>
        {showApplyModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowApplyModal(false)}
            ></div>
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg"
            >
              <QuickApplyModal
                job={selectedJob}
                onClose={() => setShowApplyModal(false)}
                onApply={(updatedJob) => {
                  const updatedJobs = jobs.map((job) =>
                    job.id === updatedJob.id ? { ...job, applied: true } : job,
                  );
                  setJobs(updatedJobs);
                  setShowApplyModal(false);
                }}
                userId={userId}
              />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* 📍 Footer */}
      <footer className="w-full bg-gradient-to-r from-ink via-ink to-ink border-t border-brand-500/20 py-8 relative z-10 mt-auto">
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 text-center text-paper space-y-2 font-outfit">
          <p className="text-sm sm:text-base opacity-90">
            &copy; {new Date().getFullYear()} CareerNexus. All rights reserved.
          </p>
          <p className="text-xs opacity-60">Your one-stop placement tracker</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentApplyJobs;
