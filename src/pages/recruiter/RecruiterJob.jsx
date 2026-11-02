import { isPastDeadline, formatSalary } from "../../services/jobs";
import { PageHeader } from "../../components/ui";
import useDialog from "../../hooks/useDialog";
// RecruiterJob.jsx (Updated Theme Version)
import React, { useState, useEffect, useCallback } from "react";
import NavbarRecruiterDashboard from "../../components/NavbarRecruiterDashboard";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlinePencil,
  HiMagnifyingGlass,
  HiOutlineDocumentPlus,
  HiCheckCircle,
} from "react-icons/hi2";
import { RiSuitcaseLine } from "react-icons/ri";
import requestApi from "../../services/request";
import getUserId from "../../services/getUserId";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const RecruiterJob = () => {
  const userId = getUserId();

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [jobPosts, setJobPosts] = useState([]);
  const [job, setJob] = useState({
    job_id: "",

    company_name: "",
    job_title: "",
    job_description: "",
    recruitment_process: "",
    salary_package: "",
    location: [],
    newLocation: "",
    application_deadline: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const detailRef = useDialog(showModal, () => setShowModal(false));
  const deleteRef = useDialog(showDeleteModal, () => setShowDeleteModal(false));
  const jobsPerPage = 5;

  function parseLocations(loc) {
    if (Array.isArray(loc)) return loc;
    try {
      return JSON.parse(loc);
    } catch {
      return [loc];
    }
  }

  const showToast = useCallback((message, type = "success") => {
    if (type === "danger" || type === "error") {
      toast.error(message, { id: "recruiter-job-error" });
    } else {
      toast.success(message, { id: "recruiter-job-success" });
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await requestApi.get(`/jobs/recruiter`);
      const mappedJobs = res.data.map((job) => ({
        ...job,
        company_name: job.companyName || job.company_name,
        job_title: job.jobTitle || job.job_title,
        job_description: job.jobDescription || job.job_description,
        recruitment_process: job.recruitmentProcess || job.recruitment_process,
        salary_package: job.salaryPackage || job.salary_package,
        locations:
          parseLocations(job.locations) || parseLocations(job.location),
        application_deadline:
          job.applicationDeadline || job.application_deadline,
      }));
      setJobPosts(mappedJobs);

      if (mappedJobs.length === 0) {
        showToast("No jobs found. Start posting your jobs!");
      }
    } catch {
      showToast("Failed to fetch jobs", "danger");
    }
  }, [showToast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showModal, showDeleteModal, editIndex, currentPage]);

  const handlePostJob = async () => {
    const isEditing = editIndex !== null;
    const hasEmpty =
      !job.company_name ||
      !job.job_title ||
      !job.job_description ||
      !job.recruitment_process ||
      !job.salary_package ||
      !job.application_deadline ||
      job.location.length === 0;

    if (hasEmpty) return showToast("Fill all fields", "danger");

    const payload = {
      postedBy: { userId },
      companyName: job.company_name,
      jobTitle: job.job_title,
      jobDescription: job.job_description,
      recruitmentProcess: job.recruitment_process,
      salaryPackage: job.salary_package,
      locations: JSON.stringify(job.location),
      applicationDeadline: job.application_deadline,
    };

    try {
      if (isEditing) {
        const jobId =
          filteredJobs[editIndex + (currentPage - 1) * jobsPerPage].id;
        const res = await requestApi.put(`/jobs/${jobId}`, payload);
        if (res.status === 200 || res.status === 201) {
          await fetchJobs();
          showToast("Job updated successfully!");
        }
      } else {
        const res = await requestApi.post(`/jobs/post`, payload);
        if (res.status === 200 || res.status === 201) {
          await fetchJobs();
          showToast("Job posted successfully!");
          setShowSuccessAnimation(true);
          setTimeout(() => setShowSuccessAnimation(false), 2000);
        }
      }

      setJob({
        company_name: "",
        job_title: "",
        job_description: "",
        recruitment_process: "",
        salary_package: "",
        location: [],
        newLocation: "",
        application_deadline: "",
      });
      setEditIndex(null);
    } catch (error) {
      console.error("Job post failed:", error);
      showToast("Failed to post job", "danger");
    }
  };

  const handleEdit = (index) => {
    const jobToEdit = filteredJobs[index + (currentPage - 1) * jobsPerPage];
    setJob({
      company_name: jobToEdit.company_name || jobToEdit.companyName,
      job_title: jobToEdit.job_title || jobToEdit.jobTitle,
      job_description: jobToEdit.job_description || jobToEdit.jobDescription,
      recruitment_process:
        jobToEdit.recruitment_process || jobToEdit.recruitmentProcess,
      salary_package: jobToEdit.salary_package || jobToEdit.salaryPackage,
      location: jobToEdit.locations || [],
      newLocation: "",
      application_deadline:
        jobToEdit.application_deadline || jobToEdit.applicationDeadline,
    });
    setEditIndex(index);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index + (currentPage - 1) * jobsPerPage);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    const jobId = filteredJobs[deleteIndex].id;
    try {
      await requestApi.delete(`/jobs/${jobId}`);
      setJobPosts(jobPosts.filter((_, i) => i !== deleteIndex));
      setShowDeleteModal(false);
      showToast("Job deleted", "danger");
    } catch {
      showToast("Failed to delete job", "danger");
    }
  };

  const openModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const filteredJobs = jobPosts.filter(
    (job) =>
      (job.company_name || job.companyName)
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      (job.job_title || job.jobTitle)
        .toLowerCase()
        .includes(filterText.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage,
  );

  return (
    <>
      <NavbarRecruiterDashboard />

      <div className="cn-job-page-heading">
        <PageHeader
          eyebrow="OPEN DOORS. BUILD GREAT TEAMS."
          title="Your job postings"
          description="Create opportunities and manage your campus openings."
        />
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
              <HiCheckCircle size={24} />
            </div>
            <p className="font-semibold text-sm tracking-wide">
              Job Saved Successfully!
            </p>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="cn-data-page min-h-screen pt-6 pb-16 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 font-outfit select-none">
        <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-8 items-start">
          {/* Form Container (Left Column) */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full xl:w-[400px] shrink-0 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 xl:sticky xl:top-32 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-10 opacity-70"></div>
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100">
                <RiSuitcaseLine size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                {editIndex !== null ? "Edit Job" : "Post New Job"}
              </h2>
            </div>

            <div className="space-y-5">
              {/* Form Inputs */}
              {Object.entries({
                company_name: "Company Name",
                job_title: "Job Title",
                salary_package: "Salary (LPA)",
                application_deadline: "Deadline",
              }).map(([key, label]) => (
                <div key={key}>
                  <label className="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {label}
                  </label>
                  <input
                    aria-label={String(key).replaceAll("_", " ")}
                    name={key}
                    type={key === "application_deadline" ? "date" : "text"}
                    value={job[key]}
                    onChange={(e) => setJob({ ...job, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-semibold"
                  />
                </div>
              ))}

              {/* Location Input */}
              <div>
                <label className="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Locations
                </label>
                <div className="w-full flex flex-col gap-3">
                  <input
                    aria-label="Type location & press Enter"
                    type="text"
                    value={job.newLocation || ""}
                    onChange={(e) =>
                      setJob({ ...job, newLocation: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && job.newLocation.trim()) {
                        e.preventDefault();
                        if (!job.location.includes(job.newLocation.trim())) {
                          setJob({
                            ...job,
                            location: [...job.location, job.newLocation.trim()],
                            newLocation: "",
                          });
                        }
                      }
                    }}
                    placeholder="Type location & press Enter"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-semibold"
                  />
                  {job.location.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {parseLocations(job.location).map((loc, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100"
                        >
                          {loc}
                          <button
                            type="button"
                            onClick={() =>
                              setJob({
                                ...job,
                                location: parseLocations(job.location).filter(
                                  (_, i) => i !== idx,
                                ),
                              })
                            }
                            className="hover:text-red-500 ml-1 text-base leading-none"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Textareas */}
              {["job_description", "recruitment_process"].map((key) => (
                <div key={key}>
                  <label className="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {key === "job_description" ? "Description" : "Process"}
                  </label>
                  <textarea
                    aria-label={String(key).replaceAll("_", " ")}
                    rows="3"
                    name={key}
                    value={job[key]}
                    onChange={(e) => setJob({ ...job, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-semibold"
                    placeholder={`Enter details...`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handlePostJob}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold tracking-wide transition-all shadow-md shadow-slate-900/10"
              >
                {editIndex !== null ? "Update Job Post" : "Publish Job Post"}
              </button>
              {editIndex !== null && (
                <button
                  onClick={() => {
                    setEditIndex(null);
                    setJob({
                      company_name: "",
                      job_title: "",
                      job_description: "",
                      recruitment_process: "",
                      salary_package: "",
                      location: [],
                      newLocation: "",
                      application_deadline: "",
                    });
                  }}
                  className="w-full py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </Motion.div>

          {/* Right Column (Job List & Filters) */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 w-full flex flex-col gap-6"
          >
            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-3 flex items-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-brand-500"></div>
              <HiMagnifyingGlass className="text-slate-400 text-2xl absolute left-8" />
              <input
                aria-label="Search by company or job title..."
                type="text"
                placeholder="Search by company or job title..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 font-semibold text-lg"
              />
            </div>

            {/* List */}
            <div className="space-y-4">
              {currentJobs.map((job, index) => (
                <Motion.div
                  key={job.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 5) * 0.04 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all p-6 sm:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group"
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[11px] font-extrabold uppercase tracking-wider rounded-lg border border-brand-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>{" "}
                        {isPastDeadline(job.application_deadline || job.applicationDeadline) ? "Closed" : "Open"}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase border border-slate-200 px-2 py-0.5 rounded-lg bg-slate-50">
                        ID: {job.job_id || job.id}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-1 leading-tight tracking-tight">
                      {job.job_title || job.jobTitle}
                    </h4>
                    <p className="text-brand-600 font-bold text-lg mb-5">
                      {job.company_name || job.companyName}
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <div className="col-span-2 lg:col-span-2">
                        <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                          Locations
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {parseLocations(job.location || job.locations).map(
                            (loc, i) => (
                              <span
                                key={i}
                                className="text-slate-700 font-semibold text-sm bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm"
                              >
                                {loc}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                          Package
                        </p>
                        <p className="text-slate-800 font-bold text-sm bg-white px-2 py-0.5 rounded-md border border-slate-200 inline-block shadow-sm">
                          {formatSalary(job.salary_package || job.salaryPackage)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                          Deadline
                        </p>
                        <p className="text-slate-800 font-bold text-sm bg-white px-2 py-0.5 rounded-md border border-slate-200 inline-block shadow-sm">
                          {job.application_deadline || job.applicationDeadline}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button
                      onClick={() => openModal(job)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-600 hover:text-brand-600 rounded-xl text-sm font-bold transition-all border border-slate-200 shadow-sm"
                    >
                      <HiOutlineEye size={18} className="stroke-2" /> View
                    </button>
                    <button
                      onClick={() => handleEdit(index)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-600 hover:text-brand-600 rounded-xl text-sm font-bold transition-all border border-slate-200 shadow-sm"
                    >
                      <HiOutlinePencil size={18} className="stroke-2" /> Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(index)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-sm font-bold transition-all border border-slate-200 shadow-sm"
                    >
                      <HiOutlineTrash size={18} className="stroke-2" /> Delete
                    </button>
                  </div>
                </Motion.div>
              ))}

              {currentJobs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <RiSuitcaseLine size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    No Jobs Found
                  </h3>
                  <p className="text-slate-500 mt-2 font-medium">
                    Adjust your filters or post a new job.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm w-fit mx-auto">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-xl text-lg flex items-center justify-center transition-all ${currentPage === i + 1 ? "bg-slate-900 text-white font-black shadow-md" : "bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold border border-slate-200"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </Motion.div>
        </div>
      </div>

      {/* Modernised Modals */}
      <AnimatePresence>
        {showModal && selectedJob && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6"
          >
            <Motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              ref={detailRef}
              role="dialog"
              aria-modal="true"
              aria-label="Job posting details"
              tabIndex={-1}
              className="cn-dialog relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] border border-slate-200"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                aria-label="Close modal"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div className="flex items-start gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 border border-brand-100 shadow-sm">
                  <RiSuitcaseLine size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    {selectedJob.job_title || selectedJob.jobTitle}
                  </h2>
                  <p className="text-brand-600 font-bold text-lg mt-1">
                    {selectedJob.company_name || selectedJob.companyName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Package
                  </p>
                  <p className="font-extrabold text-slate-800 text-lg">
                    {formatSalary(selectedJob.salary_package || selectedJob.salaryPackage)}
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Deadline
                  </p>
                  <p className="font-extrabold text-slate-800 text-lg">
                    {selectedJob.application_deadline ||
                      selectedJob.applicationDeadline}
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Locations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {parseLocations(
                      selectedJob.location || selectedJob.locations,
                    ).map((loc, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-6">
                <h3 className="text-xs font-black text-brand-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div> Job
                  Description
                </h3>
                <div className="prose prose-sm prose-slate max-w-none text-slate-700 font-medium">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selectedJob.job_description || selectedJob.jobDescription}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-black text-brand-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>{" "}
                  Recruitment Process
                </h3>
                <div className="prose prose-sm prose-slate max-w-none text-slate-700 font-medium">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selectedJob.recruitment_process ||
                      selectedJob.recruitmentProcess}
                  </p>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4"
          >
            <Motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              ref={deleteRef}
              role="dialog"
              aria-modal="true"
              aria-label="Delete job posting"
              tabIndex={-1}
              className="cn-dialog bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <HiOutlineTrash size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Delete Job?
              </h3>
              <p className="text-slate-500 mb-8 text-sm font-medium">
                This action cannot be undone. All candidates linked to this job
                will also lose connection to it.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-md shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* 📍 Footer */}
      <footer className="w-full bg-gradient-to-r from-ink via-ink to-ink border-t border-brand-500/20 py-8 mt-10">
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 text-center text-paper space-y-2 font-outfit">
          <p className="text-sm sm:text-base opacity-90">
            &copy; {new Date().getFullYear()} CareerNexus. All rights reserved.
          </p>
          <p className="text-xs opacity-60">Your one-stop placement tracker</p>
        </div>
      </footer>
    </>
  );
};

export default RecruiterJob;
