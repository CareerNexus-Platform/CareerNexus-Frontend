// src/pages/student/StudentApplications.jsx

import React, { useEffect, useState } from "react";
import NavbarStudentDashboard from "../../components/NavbarStudentDashboard";
import {
  FaClock,
  FaMapMarkerAlt,
  FaBuilding,
  FaArrowLeft,
  FaFilePdf,
  FaInfoCircle,
  FaCalendarAlt,
  FaTasks,
  FaWallet,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import requestApi from "../../services/request";
import getUserId from "../../services/getUserId";
import toast from "react-hot-toast";

const StudentApplications = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobRounds, setJobRounds] = useState([]);
  const [isLoadingRounds, setIsLoadingRounds] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest");
  const [isLoading, setIsLoading] = useState(true);
  const userId = getUserId();
  const backendUrl = import.meta.env.VITE_APP_BACKEND_HOST;
  const backendPort = import.meta.env.VITE_APP_BACKEND_PORT;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await requestApi.get(`/applications/my-applications`);
        if (res && Array.isArray(res.data) && res.data.length > 0) {
                                      // Default sort to latest
          const sorted = [...res.data].sort(
            (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate),
          );
          setAppliedJobs(sorted);
          toast.success("Applications fetched successfully!", {
            id: "fetch-applications",
          });
        } else if (res && Array.isArray(res.data) && res.data.length === 0) {
          setAppliedJobs([]);
          toast("You have not applied to any jobs yet.", {
            id: "no-apps",
            icon: "ℹ️",
          });
        }

      } catch (error) {
        setAppliedJobs([]);
        toast.error("Failed to fetch applications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [userId]);



  
  
  
                              // Fetch rounds when a job is selected


  useEffect(() => {
    const fetchJobRounds = async () => {
      if (!selectedJob?.jobPost?.id) return;
      setIsLoadingRounds(true);
      try {
        const res = await requestApi.get(
          `/exam/student/${selectedJob.jobPost.id}`,
        );
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




  const sortByDate = (order) => {
    const sorted = [...appliedJobs].sort((a, b) => {
      const dateA = new Date(a.applicationDate);
      const dateB = new Date(b.applicationDate);
      return order === "latest" ? dateB - dateA : dateA - dateB;
    });
    setAppliedJobs(sorted);
    setSortOrder(order);
  };

  const getStatusStyle = (status) => {
    switch (status.toUpperCase()) {
      case "ACCEPTED":
      case "SELECTED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
      case "PENDING":
      case "UNDER REVIEW":
        return "bg-amber-100 text-amber-700 border-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };




  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F8E5EB] to-[#E4EBFE] font-poppins relative overflow-hidden">
      
      
      
                              {/* Background Decorative Elements */}

                              
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <NavbarStudentDashboard />

      <motion.div
        className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pt-28 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Link
                to={`/student/${userId}/home`}
                className="group flex items-center justify-center w-12 h-12 bg-white/70 backdrop-blur-md border border-white/60 hover:border-violet-300 rounded-full text-violet-600 hover:text-violet-700 shadow-sm hover:shadow-md transition-all duration-300"
                title="Back to Dashboard"
              >
                <FaArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </Link>
              <div>
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-200 mb-2 backdrop-blur-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
                    Tracker
                  </span>
                </motion.div>
                <h2 className="text-4xl font-extrabold text-[#2F2F5B] tracking-tight">
                  Your Applications
                </h2>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-2 shadow-sm flex items-center gap-3">
              <label className="pl-2 font-semibold text-sm text-violet-800 uppercase tracking-widest">
                Sort:
              </label>
              <select
                value={sortOrder}
                onChange={(e) => sortByDate(e.target.value)}
                className="bg-white border-none rounded-xl px-4 py-2 text-sm font-medium text-[#4b436f] focus:outline-none focus:ring-2 focus:ring-violet-300 shadow-sm cursor-pointer outline-none transition-all"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>



          {/* Applications List */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(107,78,207,0.05)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                <p className="text-[#4b436f] font-medium">
                  Loading your applications...
                </p>
              </div>
            ) : appliedJobs.length === 0 ? (
              <div className="text-center py-16 bg-white/50 border border-dashed border-violet-200 rounded-2xl">
                <FaInfoCircle className="mx-auto text-5xl text-violet-300 mb-4" />
                <h3 className="text-xl font-bold text-[#2C225A] mb-2">
                  No Applications Yet
                </h3>
                <p className="text-[#4b436f] max-w-md mx-auto">
                  You haven't applied to any jobs yet. Browse the job portal to
                  find exciting opportunities!
                </p>
                <Link
                  to={`/student/${userId}/apply-jobs`}
                  className="mt-6 inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Find Jobs Now
                </Link>
              </div>
              
            ) : (
              <div className="grid gap-5">
                <AnimatePresence>
                  {appliedJobs.map((app, index) => {
                    const locations =
                      JSON.parse(app.jobPost.locations || "[]") || [];
                    const isRejected = app.status?.toUpperCase() === "REJECTED";
                    const isAccepted =
                      app.status?.toUpperCase() === "ACCEPTED" ||
                      app.status?.toUpperCase() === "SELECTED";

                    return (
                      <motion.div
                        key={app._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white/80 backdrop-blur p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start justify-between border border-violet-100 hover:border-violet-300 transition-all shadow-sm hover:shadow-[0_8px_25px_rgba(107,78,207,0.1)] relative overflow-hidden"
                      >
                        {/* Status Indicator Bar */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            isAccepted
                              ? "bg-emerald-500"
                              : isRejected
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                        ></div>

                        {/* Left Side */}
                        <div className="flex gap-5 items-start w-full md:w-[75%] pl-2">
                          <div className="bg-gradient-to-br from-violet-100 to-indigo-50 text-violet-600 rounded-xl p-3 shadow-sm border border-violet-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                            <FaBuilding size={28} />
                          </div>
                          <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                              <h3 className="font-extrabold text-lg text-[#2C225A] group-hover:text-violet-700 transition-colors uppercase tracking-tight">
                                {app.jobPost.jobTitle}
                              </h3>
                            </div>
                            <p className="text-base text-violet-600 font-semibold mb-3">
                              {app.jobPost.companyName}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-[#4b436f] bg-violet-50/50 p-3 rounded-xl border border-violet-100/50">
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                                <FaMapMarkerAlt className="text-violet-400" />
                                <span className="font-medium">
                                  {locations.join(", ") || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                                <FaCalendarAlt className="text-blue-400" />
                                <span className="font-medium">
                                  {new Date(
                                    app.applicationDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                                <FaClock className="text-amber-400" />
                                <span className="font-medium">
                                  {new Date(
                                    app.applicationDate,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>

                            {(app.feedback || app.appliedResumeUrl) && (
                              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                {app.appliedResumeUrl && (
                                  <a
                                    href={`${backendUrl}:${backendPort}/uploads/resumes${app.appliedResumeUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors border border-violet-100"
                                  >
                                    <FaFilePdf className="text-red-500" /> View
                                    Resume
                                  </a>
                                )}
                                {app.feedback && (
                                  <div className="inline-flex items-center gap-1.5 text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 max-w-full truncate">
                                    <FaInfoCircle className="text-blue-400 flex-shrink-0" />
                                    <span className="truncate">
                                      Feedback: {app.feedback}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-[25%] gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 h-full">
                          <span
                            className={`px-4 py-1.5 text-sm font-bold rounded-full border tracking-wide inline-flex items-center justify-center text-center ${getStatusStyle(
                              app.status,
                            )}`}
                          >
                            {app.status}
                          </span>
                          <button
                            onClick={() => setSelectedJob(app)}
                            className="text-violet-600 hover:text-violet-800 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors border border-transparent hover:border-violet-200"
                          >
                            View Details &rarr;
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal View */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              onClick={() => setSelectedJob(null)}
            ></div>
            <motion.div
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden font-poppins border border-violet-100"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <button
                className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedJob(null)}
              >
                &#x2715;
              </button>
              <h3 className="text-xl font-bold mb-1">
                {selectedJob.jobPost.jobTitle}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {selectedJob.jobPost.companyName}
              </p>
              <p className="text-sm mb-2">
                <strong>Salary:</strong> ₹{selectedJob.jobPost.salaryPackage}
              </p>
              <p className="text-sm mb-2">
                <strong>Deadline:</strong>{" "}
                {selectedJob.jobPost.applicationDeadline}
              </p>
              <p className="text-sm mb-2">
                <strong>Recruitment Process:</strong>{" "}
                {selectedJob.jobPost.recruitmentProcess}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Description:</strong>{" "}
                {selectedJob.jobPost.jobDescription}
              </p>

              {/* Assessment Rounds Section */}
              <div className="mt-6 p-4 bg-purple-50/30 rounded-xl border border-purple-100">
                <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                  🚀 Scheduled Assessment Rounds
                </h4>
                {isLoadingRounds ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-purple-600"></div>
                  </div>
                ) : jobRounds.length > 0 ? (
                  <div className="space-y-3">
                    {jobRounds.map((round, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-50 shadow-sm transition-all hover:border-purple-200"
                      >
                        <div className="bg-purple-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {round.roundName}
                            </p>
                            {/* Status Badge */}
                            {round.attempted ? (
                              <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                Solved
                              </span>
                            ) : (
                              (() => {
                                const now = new Date();
                                const start = new Date(round.startTime);
                                const end = new Date(round.endTime);
                                if (now < start)
                                  return (
                                    <span className="bg-blue-100 text-blue-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                      Upcoming
                                    </span>
                                  );
                                if (now > end)
                                  return (
                                    <span className="bg-gray-100 text-gray-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                      Ended
                                    </span>
                                  );
                                return (
                                  <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                                    Live
                                  </span>
                                );
                              })()
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                              <span className="font-semibold text-purple-600">
                                Start:
                              </span>
                              {new Date(round.startTime).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                              <span className="font-semibold text-purple-600">
                                End:
                              </span>
                              {new Date(round.endTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {/* Start Assessment Button or Attempted Status */}
                        {round.attempted ? (
                          <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-md shrink-0 self-center cursor-not-allowed">
                            Attempted
                          </span>
                        ) : (
                          new Date() >= new Date(round.startTime) &&
                          new Date() <= new Date(round.endTime) && (
                            <Link
                              to={round.examUrl}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-1 rounded-md transition-colors shrink-0 self-center"
                            >
                              Start Assessment
                            </Link>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-white/50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-400 italic">
                      No specific assessment rounds configured yet.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📍 Footer */}
      <footer className="w-full bg-gradient-to-r from-[#130c22] via-[#1b1435] to-[#0f0c1d] border-t border-violet-500/20 py-8 relative z-10 mt-auto">
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 text-center text-[#EADFFD] space-y-2 font-outfit">
          <p className="text-sm sm:text-base opacity-90">
            &copy; {new Date().getFullYear()} CareerNexus. All rights reserved.
          </p>
          <p className="text-xs opacity-60">Your one-stop placement tracker</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentApplications;
