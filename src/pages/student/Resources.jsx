import React, { useState, useRef, useEffect } from "react";
import NavbarStudentDashboard from "../../components/NavbarStudentDashboard";
import {
  FaBook,
  FaCode,
  FaFilePdf,
  FaYoutube,
  FaArrowLeft,
  FaSearch,
  FaTrashAlt,
  FaDownload,
  FaExternalLinkAlt
} from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { academicStructure } from "./AcademicData";
import ShareResource from "./ShareResource";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Link } from "react-router-dom";
import getUserId from "../../services/getUserId";
import requestApi from "../../services/request";
import toast from "react-hot-toast";

const branches = [
  "CSE", "CSE-AI", "CSE-DS", "CSE-AIML", "CSE-CS", "CSE-IT",
  "ECE", "EEE", "CIVIL", "MECH",
];

const Resources = () => {
  const [category, setCategory] = useState(null);
  const [year, setYear] = useState("");
  const [regulation, setRegulation] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [sharedResources, setSharedResources] = useState([]);
  const [showShareForm, setShowShareForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const subjectsRef = useRef(null);

  const fetchResources = async () => {
    try {
      const response = await requestApi.get("/resources/all");
      const formattedResources = response.data.map((res) => ({
        id: res.id,
        year: parseInt(res.year),
        regulation: res.regulation,
        semester: res.semester,
        branch: res.branch,
        subject: res.title,
        description: res.description,
        pdf: res.fileUrl,
        videoLink: res.resourceLink,
        uploadedBy: res.uploadedById
      }));
      setSharedResources(formattedResources);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      toast.error("Could not load resources.");
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleShareResource = () => {
    fetchResources();
    setShowShareForm(false);

    setTimeout(() => {
      if (subjectsRef.current) {
        subjectsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 500);
  };

  const getSubjects = () => {
    const filtered = sharedResources.filter(
      (res) =>
        res.year === year &&
        res.regulation === regulation &&
        res.semester === semester &&
        res.branch === branch
    );
    const subjects = {};
    filtered.forEach((res) => {
      if (!subjects[res.subject]) subjects[res.subject] = [];
      subjects[res.subject].push(res);
    });
    return subjects;
  };

  const handleBack = () => {
    if (branch) setBranch("");
    else if (semester) setSemester("");
    else if (regulation) setRegulation("");
    else if (year) setYear("");
    else setCategory(null);
  };

  const getPageHeading = () => {
    if (category === "academic") return "Academic Resources";
    if (category === "technical") return "Technical Resources";
    return "Student Resources";
  };

  const confirmDelete = (resourceId) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-red-100 max-w-sm w-full mx-auto text-center space-y-6 shadow-[0_8px_32px_rgba(220,38,38,0.15)] font-outfit">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <FaTrashAlt className="text-2xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Confirm Deletion</h2>
          <p className="text-gray-600 text-sm">Are you sure you want to permanently delete this resource? This action cannot be undone.</p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-md shadow-red-500/30 transition-colors"
              onClick={async () => {
                try {
                  await requestApi.delete(`/resources/${resourceId}?userId=${getUserId()}`);
                  toast.success("Resource deleted successfully");
                  fetchResources();
                } catch {
                  toast.error("Failed to delete resource");
                }
                onClose();
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      overlayClassName: "bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50",
    });
  };

  const technicalResources = {
    "Programming Languages": ["C", "C++", "Java", "Python", "JavaScript", "Go"],
    "Web Development": ["HTML", "CSS", "React", "Node.js", "Next.js", "Express"],
    "Data Structures & Algorithms": ["Stacks", "Queues", "Trees", "Graphs", "Dynamic Programming", "Sorting"],
    "Core CS Subjects": ["Operating Systems", "Computer Networks", "DBMS", "System Design"]
  };

  const filteredTechnicalResources = Object.entries(technicalResources).reduce(
    (acc, [cat, topics]) => {
      const filtered = topics.filter((topic) =>
        topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) acc[cat] = filtered;
      return acc;
    },
    {}
  );

  return (
    <div className="cn-data-page flex flex-col min-h-screen bg-gradient-to-br from-canvas to-canvas font-poppins relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <NavbarStudentDashboard />

      <Motion.div
        className="flex-grow max-w-7xl mx-auto space-y-10 relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 w-full z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28 }}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link
              to={`/student/${getUserId()}/home`}
              className="group flex items-center justify-center w-12 h-12 bg-white/70 backdrop-blur-md border border-white/60 hover:border-brand-300 rounded-full text-brand-600 hover:text-brand-700 shadow-sm hover:shadow-md transition-all duration-300"
              title="Back to Dashboard"
            >
              <FaArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <Motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 border border-brand-200 mb-2 backdrop-blur-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Learning Hub</span>
              </Motion.div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-ink tracking-tight">{getPageHeading()}</h1>
            </div>
          </div>

          <AnimatePresence>
            {category === "academic" && !showShareForm && (
              <Motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setShowShareForm(true)}
                className="bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 text-white px-6 py-3 rounded-xl shadow-[0_4px_15px_rgba(65, 45, 32,0.3)] hover:shadow-[0_6px_20px_rgba(65, 45, 32,0.4)] transition-all font-semibold flex items-center gap-2"
              >
                <span>➕</span> Share Resources
              </Motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Share Form Modal Context */}
        <AnimatePresence>
          {showShareForm && category === "academic" && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(65, 45, 32,0.1)] relative"
            >
              <button
                onClick={() => setShowShareForm(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700"
              >
                ✖
              </button>
              <ShareResource
                onShare={handleShareResource}
                onClose={() => setShowShareForm(false)}
              />
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Main Category Selection */}
        {!category && (
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 max-w-5xl mx-auto"
          >
            <Motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategory("academic")}
              className="group relative bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-10 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(65, 45, 32,0.08)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400/0 to-brand-400/0 group-hover:from-brand-400/5 group-hover:to-brand-400/5 transition-colors duration-500"></div>

              <div className="w-24 h-24 bg-gradient-to-br from-brand-100 to-brand-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-brand-100 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <FaBook className="text-5xl text-brand-500" />
              </div>

              <span className="text-3xl font-extrabold text-ink mb-3 group-hover:text-brand-700 transition-colors">Academic</span>
              <p className="text-muted text-center text-lg leading-relaxed max-w-xs">
                Syllabus-wise subjects, notes, previous papers & study materials.
              </p>
            </Motion.button>

            <Motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategory("technical")}
              className="group relative bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-10 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(65, 45, 32,0.08)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400/0 to-brand-400/0 group-hover:from-brand-400/5 group-hover:to-brand-400/5 transition-colors duration-500"></div>

              <div className="w-24 h-24 bg-gradient-to-br from-brand-100 to-brand-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-brand-100 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                <FaCode className="text-5xl text-brand-500" />
              </div>

              <span className="text-3xl font-extrabold text-ink mb-3 group-hover:text-brand-700 transition-colors">Technical</span>
              <p className="text-muted text-center text-lg leading-relaxed max-w-xs">
                Programming, DSA, web dev, interview prep, and video tutorials.
              </p>
            </Motion.button>
          </Motion.div>
        )}

        {/* Academic Flow */}
        {category === "academic" && (
          <div className="space-y-8">
            {/* Breadcrumb / Back Button */}
            <AnimatePresence>
              {(year || regulation || semester || branch) && (
                <Motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-brand-100 rounded-2xl px-5 py-2.5 shadow-sm text-brand-800 font-semibold w-fit"
                >
                  <button onClick={handleBack} className="text-brand-500 hover:text-brand-700 text-lg transition-colors p-1 rounded-full hover:bg-brand-100">
                    <FaArrowLeft />
                  </button>
                  <div className="w-[1px] h-5 bg-brand-200 mx-1"></div>
                  <span className="text-sm tracking-wide">
                    {year && <span className="text-ink">{year === 1 ? "1st" : year === 2 ? "2nd" : year === 3 ? "3rd" : "4th"} Year</span>}
                    {regulation && <span> <span className="text-brand-300 mx-1">/</span> <span className="text-ink">{regulation}</span></span>}
                    {semester && <span> <span className="text-brand-300 mx-1">/</span> <span className="text-ink">Sem {semester}</span></span>}
                    {branch && <span> <span className="text-brand-300 mx-1">/</span> <span className="text-ink">{branch}</span></span>}
                  </span>
                </Motion.div>
              )}
            </AnimatePresence>

            {/* Selection Steps */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-[0_8px_30px_rgba(65, 45, 32,0.05)]">
              {!year && (
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                    <span className="bg-brand-100 text-brand-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                    Select Academic Year
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((y) => (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className="group bg-white hover:bg-brand-600 text-muted hover:text-white border border-brand-100 px-6 py-5 rounded-2xl font-bold text-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      >
                        {y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : "4th"} Year
                      </button>
                    ))}
                  </div>
                </Motion.div>
              )}

              {year && !regulation && (
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                    <span className="bg-brand-100 text-brand-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                    Select Regulation
                  </h2>
                  <div className="flex gap-4 flex-wrap">
                    {Object.keys(academicStructure).map((reg) => (
                      <button
                        key={reg}
                        onClick={() => setRegulation(reg)}
                        className="group bg-white hover:bg-brand-600 text-muted hover:text-white border border-brand-100 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[120px]"
                      >
                        {reg}
                      </button>
                    ))}
                  </div>
                </Motion.div>
              )}

              {regulation && !semester && (
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                    <span className="bg-brand-100 text-brand-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                    Select Semester
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(academicStructure[regulation])
                      .filter((sem) => sem.startsWith(`${year}-`))
                      .map((sem) => (
                        <button
                          key={sem}
                          onClick={() => setSemester(sem)}
                          className="group bg-white hover:bg-brand-600 text-muted hover:text-white border border-brand-100 px-6 py-5 rounded-2xl font-bold text-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                          Semester {sem.split('-')[1] || sem}
                        </button>
                      ))}
                  </div>
                </Motion.div>
              )}

              {semester && !branch && (
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                    <span className="bg-brand-100 text-brand-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
                    Select Branch
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {branches.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBranch(b)}
                        className="group bg-white hover:bg-brand-600 text-muted hover:text-white border border-brand-100 px-4 py-4 rounded-2xl font-bold shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </Motion.div>
              )}

              {branch && (
                <Motion.div ref={subjectsRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-200 border-dashed">
                    <h2 className="text-3xl font-extrabold text-ink flex items-center gap-3">
                      <FaBook className="text-brand-500" />
                      Subject Resources
                    </h2>
                    <span className="bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                      {Object.keys(getSubjects()).length} Subjects Found
                    </span>
                  </div>

                  {Object.keys(getSubjects()).length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-8">
                      {Object.entries(getSubjects()).map(([subject, resources]) => (
                        <Motion.div
                          key={subject}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4 }}
                          className="bg-white/80 border border-brand-100/60 p-6 sm:p-8 rounded-3xl shadow-[0_4px_20px_rgba(65, 45, 32,0.06)] hover:shadow-[0_8px_30px_rgba(65, 45, 32,0.12)] transition-all flex flex-col h-full relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-brand-400/10 transition-colors"></div>

                          <h3 className="text-xl sm:text-2xl font-bold text-ink mb-6 pb-4 border-b border-gray-100">
                            {subject}
                          </h3>

                          <div className="flex-grow space-y-6">
                            {resources.map((res, i) => (
                              <div key={i} className="flex flex-col p-5 bg-gray-50/50 rounded-2xl border border-gray-100 gap-4 hover:border-brand-200 transition-colors">
                                <p className="text-muted text-sm">
                                  <span className="font-semibold text-gray-700 block mb-1">📝 Description:</span>
                                  {res.description || "No specific description provided for this material."}
                                </p>

                                <div className="flex flex-wrap gap-3 mt-2">
                                  {res.pdf && (
                                    <>
                                      <a
                                        href={res.pdf}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                                      >
                                        <FaFilePdf /> View PDF
                                      </a>
                                      <a
                                        href={res.pdf}
                                        download
                                        className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                                      >
                                        <FaDownload /> Download
                                      </a>
                                    </>
                                  )}

                                  {res.videoLink && (
                                    <a
                                      href={res.videoLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                      <FaYoutube className="text-red-500" /> Watch Video
                                    </a>
                                  )}
                                </div>

                                {getUserId() === String(res.uploadedBy) && (
                                  <div className="mt-2 pt-3 border-t border-gray-200 border-dashed flex justify-end">
                                    <button
                                      onClick={() => confirmDelete(res.id)}
                                      className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-xs font-semibold transition-colors"
                                    >
                                      <FaTrashAlt /> Delete My Upload
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </Motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-brand-200">
                      <div className="w-20 h-20 mx-auto bg-brand-100 rounded-full flex items-center justify-center mb-4">
                        <FaBook className="text-3xl text-brand-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No Resources Found</h3>
                      <p className="text-gray-500">Be the first to share study materials for this subject!</p>
                      <button
                        onClick={() => setShowShareForm(true)}
                        className="mt-6 px-6 py-2 bg-brand-100 text-brand-700 font-semibold rounded-full hover:bg-brand-200 transition-colors inline-block"
                      >
                        Share a Resource
                      </button>
                    </div>
                  )}
                </Motion.div>
              )}
            </div>
          </div>
        )}

        {/* Technical Resources Flow */}
        {category === "technical" && (
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(65, 45, 32,0.05)]"
          >
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
              <h2 className="text-3xl font-extrabold text-ink flex items-center gap-3">
                <FaCode className="text-brand-500" />
                Explore Tech Topics
              </h2>

              {/* Modern Search Bar */}
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input aria-label="Search skills, languages..."
                  type="text"
                  placeholder="Search skills, languages..."
                  className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur border border-brand-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-300 transition-all font-medium text-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {Object.entries(filteredTechnicalResources).map(([cat, topics], index) => (
                <Motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 5) * 0.04 }}
                  className="bg-white/80 border border-brand-50 p-6 rounded-3xl shadow-sm hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] hover:border-brand-200 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                      {cat.includes("Web") ? "🌐" : cat.includes("Data") ? "📊" : cat.includes("Core") ? "🖥️" : "💻"}
                    </div>
                    <h3 className="text-xl font-bold text-ink">{cat}</h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {topics.map((topic) => (
                      <a
                        key={topic}
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " tutorial for beginners")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-brand-50 text-gray-700 hover:text-brand-700 text-sm font-semibold rounded-xl border border-gray-200 hover:border-brand-200 transition-all shadow-sm group/btn"
                      >
                        {topic}
                        <FaExternalLinkAlt className="text-[10px] text-gray-400 group-hover/btn:text-brand-400" />
                      </a>
                    ))}
                  </div>
                </Motion.div>
              ))}

              {Object.keys(filteredTechnicalResources).length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-16">
                  <span className="text-5xl mb-4 block">🔍</span>
                  <p className="text-gray-500 font-medium text-lg">No tech topics match your search for "{searchTerm}".</p>
                </div>
              )}
            </div>
          </Motion.div>
        )}
      </Motion.div>

      {/* Footer */}
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

export default Resources;
