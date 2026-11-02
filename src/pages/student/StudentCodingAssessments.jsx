import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import NavbarStudentDashboard from "../../components/NavbarStudentDashboard";
import requestApi from "../../services/request";
import { FaCode, FaCalendarAlt, FaClock, FaChevronRight } from "react-icons/fa";

const StudentCodingAssessments = () => {
  const { userId } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await requestApi.get("/coding-exam/student/dashboard");
        setAssessments(res.data);
      } catch (err) {
        console.error("Failed to fetch assessments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  return (
    <div className="cn-data-page flex flex-col min-h-screen bg-gradient-to-br from-canvas via-paper to-paper text-ink font-poppins">
      <NavbarStudentDashboard />
      <div className="flex-grow pt-28 pb-16 px-4 max-w-6xl w-full mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-extrabold text-ink mb-2 tracking-tight">
            Coding Practice Tests
          </h1>
          <p className="text-muted text-lg">
            Practice coding challenges and improve your skills. These scores are
            for your practice and do not affect job applications.
          </p>
        </Motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
          </div>
        ) : assessments.length > 0 ? (
          <div className="space-y-4">
            {assessments.map((test, index) => {
              const startTime = new Date(test.startTime);
              const endTime = new Date(test.endTime);
              const now = new Date();
              const isActive = now >= startTime && now <= endTime;

              const isFuture = now < startTime;

              return (
                <Motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index, 5) * 0.04 }}
                  className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {isActive ? (
                      <span className="bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>{" "}
                        Live
                      </span>
                    ) : isFuture ? (
                      <span className="bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1 rounded-full">
                        Upcoming
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
                        Ended
                      </span>
                    )}
                  </div>

                  {/* Leading Icon */}
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform shrink-0">
                    🚀
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-ink truncate">
                        {test.assessmentName}
                      </h3>
                      {test.solved && (
                        <span className="bg-brand-100 text-brand-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                          Solved
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FaCalendarAlt className="text-brand-500" />
                        {startTime.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <FaClock className="text-brand-500" />
                        {startTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {endTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Score Info (if solved) */}
                  {test.solved && test.highestScore !== null && (
                    <div className="hidden md:flex flex-col items-center px-4 border-l border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Highest Score
                      </span>
                      <div className="text-lg font-black text-brand-600">
                        {test.highestScore}{" "}
                        <span className="text-xs text-gray-300 font-normal">
                          / {test.maxScore}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="w-full md:w-auto shrink-0">
                    {isActive ? (
                      test.solved ? (
                        <div className="w-full md:w-40 bg-gray-200 text-gray-500 text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                          Attempted
                        </div>
                      ) : (
                        <Link
                          to={`/student/${userId}/coding-assessment/${test.id}`}
                          className="w-full md:w-40 bg-gradient-to-r from-brand-600 to-brand-600 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:brightness-110 transition"
                        >
                          Start Now <FaChevronRight className="text-[10px]" />
                        </Link>
                      )
                    ) : isFuture ? (
                      <div className="w-full md:w-40 bg-brand-50 text-brand-600 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-brand-100">
                        Upcoming
                      </div>
                    ) : (
                      <div className="w-full md:w-40 bg-gray-50 text-gray-400 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-gray-100 italic">
                        Closed
                      </div>
                    )}
                  </div>

                  {/* Mobile score display */}
                  {test.solved && test.highestScore !== null && (
                    <div className="md:hidden flex items-center gap-2 text-xs bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                      <span className="text-brand-400 font-bold uppercase tracking-widest">
                        Score:
                      </span>
                      <span className="font-black text-brand-700">
                        {test.highestScore} / {test.maxScore}
                      </span>
                    </div>
                  )}
                </Motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-16 text-center border border-dashed border-gray-300">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-ink mb-2">
              No Practice Tests
            </h2>
            <p className="text-gray-500">
              There are no coding practice tests available at the moment. Keep
              learning and revising your skills!
            </p>
          </div>
        )}
      </div>

      {/* 📍 Footer */}
      <footer className="w-full bg-gradient-to-r from-ink via-ink to-ink border-t border-brand-500/20 py-8 mt-auto">
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

export default StudentCodingAssessments;
