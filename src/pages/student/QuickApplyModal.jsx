import React, { useState, useEffect } from "react";
import { FaTimes, FaCloudUploadAlt, FaEdit, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import requestApi from "../../services/request";
import useDialog from "../../hooks/useDialog";
import { apiErrorMessage } from "../../services/apiConfig";
import { Link } from "react-router-dom";
import { UserRound, ArrowUpRight } from "lucide-react";

const QuickApplyModal = ({ job, onClose, onApply, userId }) => {
  const [profileMissing, setProfileMissing] = useState(false);
  const dialogRef = useDialog(true, onClose);
  // Form state
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    userId: "",
    Department: "",
    Year: "",
    Cgpa: "",
    Email: "",
    Phone: "",
    skills: "",
    graduationYear: "",
    resume: null,
  });

  // Additional states
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper: safely parse arrays
  function parseArray(value) {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await requestApi.get(`/student/profile`);
        const data = res.data;
        const populated = {
          FirstName: data.firstName || "",
          LastName: data.lastName || "",
          userId: data.userId || "",
          Department: data.department || "",
          Year: data.year || "",
          Cgpa: data.cgpa || "",
          Email: data.email || "",
          Phone: data.phone || "",
          skills: parseArray(data.skills).join(", ") || "",
          graduationYear: data.graduationYear || "",
          resume: null,
        };
        setUrls(parseArray(data.urls));
        setFormData(populated);
        setOriginalData(populated);
      } catch (error) {
        if (error.response?.status === 404) {
          setProfileMissing(true);
          setIsEditing(true);
          setFormData((previous) => ({ ...previous, userId }));
        } else toast.error(apiErrorMessage(error));
      }
    };

    if (userId) fetchStudentData();
  }, [userId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = name === "resume" ? files[0] : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      const modified = Object.keys(updated).some((key) => {
        if (key === "resume") return updated.resume !== null;
        return updated[key] !== originalData[key];
      });
      setIsModified(modified);
      return updated;
    });
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!["resume", "skills"].includes(key) && !value.toString().trim()) {
        newErrors[key] = "Required";
      }
    });
    if (!formData.resume && !isEditing) newErrors.resume = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && isModified) {
      const payload = {
        userId: formData.userId,
        skills: JSON.stringify(formData.skills.split(",").map((s) => s.trim())),
        email: formData.Email,
        phone: formData.Phone,
        firstName: formData.FirstName,
        lastName: formData.LastName,
        department: formData.Department,
        year: formData.Year,
        cgpa: formData.Cgpa,
        graduationYear: formData.graduationYear,
        urls: JSON.stringify(urls),
      };

      try {
        setLoading(true);
        await requestApi.post(`/student/profile`, payload);
        toast.success("Profile updated successfully!");

        setIsEditing(false);
        setIsModified(false);
        setOriginalData(formData);
      } catch (err) {
        console.error("Failed to update profile:", err);
        toast.error("Failed to update profile. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    } else {
      if (!formData.resume) {
        toast.error("Please upload your resume.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const resumeData = new FormData();
        resumeData.append("resumeFile", formData.resume);
        await requestApi.post(`/applications/apply/${job.id}`, resumeData);

        const appliedJob = {
          ...job,
          applied: true,
          appliedDate: new Date().toISOString(),
          status: "Under Review",
        };

        toast.success("Application submitted successfully!");
        onApply(appliedJob);
      } catch (error) {
        console.error("Failed to apply for job:", error);
        toast.error(
          apiErrorMessage(
            error,
            "Your application wasn’t sent. Check your profile and resume, then try again.",
          ),
        );
        setLoading(false);
      }
    }
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      setFormData(originalData);
      setIsEditing(false);
      setIsModified(false);
    } else {
      setIsEditing(true);
    }
  };

  const fields = [
    { name: "FirstName", label: "First Name" },
    { name: "LastName", label: "Last Name" },
    { name: "userId", label: "User ID" },
    { name: "Department", label: "Department" },
    { name: "Year", label: "Year" },
    { name: "Cgpa", label: "CGPA" },
    { name: "Email", label: "Email Address" },
    { name: "Phone", label: "Phone Number" },
    { name: "skills", label: "Skills (comma separated)" },
    { name: "graduationYear", label: "Graduation Year" },
  ];

  if (profileMissing)
    return (
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Complete your profile to apply"
        tabIndex={-1}
        className="cn-dialog cn-apply-setup"
      >
        <span className="cn-empty-icon">
          <UserRound size={25} />
        </span>
        <h2>Get your profile ready first.</h2>
        <p>
          Add your personal and academic details once, then use them for every
          application. We’ll bring you back to this role when you’re done.
        </p>
        <Link
          className="cn-button"
          onClick={onClose}
          to={`/student/${userId}/profile?page=data&returnTo=${encodeURIComponent(`/student/${userId}/apply-jobs?jobId=${job.id}&apply=true`)}`}
        >
          Complete your profile
          <ArrowUpRight size={16} />
        </Link>
        <button className="cn-quiet-link" onClick={onClose}>
          Keep exploring
        </button>
      </div>
    );
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Apply for ${job.job_title}`}
      tabIndex={-1}
      className="bg-white/95 backdrop-blur-xl w-full rounded-3xl shadow-2xl relative overflow-hidden font-poppins border border-brand-100 flex flex-col max-h-[90vh]"
    >
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-600 p-6 sm:p-8 flex-shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <button
          className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all z-10"
          onClick={onClose}
          aria-label="Close application"
        >
          <FaTimes size={16} />
        </button>
        <div className="relative z-10 pr-8">
          <p className="text-brand-100 text-sm font-semibold mb-1 uppercase tracking-wider">
            Applying For
          </p>
          <h3 className="text-2xl font-extrabold text-white leading-tight mb-2">
            {job.job_title}
          </h3>
          <p className="text-brand-200 font-medium">{job.company_name}</p>
        </div>
      </div>

      {/* Scrollable Form Area */}
      <div className="p-6 sm:p-8 overflow-y-auto scrollbar-hide flex-1 bg-gradient-to-b from-white to-brand-50/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-outfit font-bold text-ink text-lg">
              Personal Details
            </h4>
            <button
              type="button"
              onClick={handleEditToggle}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isEditing
                  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  : "bg-brand-50 text-brand-600 hover:bg-brand-100 border border-brand-200"
              }`}
            >
              {isEditing ? <FaTimes /> : <FaEdit />}
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {fields.map(({ name, label }) => (
              <div key={name} className="col-span-1">
                <label
                  htmlFor={`apply-${name}`}
                  className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5"
                >
                  {label} <span className="text-red-400">*</span>
                </label>
                <input
                  id={`apply-${name}`}
                  type={name === "graduationYear" ? "number" : "text"}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full outline-none transition-all px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isEditing
                      ? "bg-white border-2 border-brand-200 focus:border-brand-500 text-gray-800 shadow-sm"
                      : "bg-gray-50/80 border border-gray-200 text-gray-600 cursor-not-allowed"
                  }`}
                />
                {errors[name] && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Resume Upload Box */}
          {!isEditing && (
            <div className="mt-8">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Resume Documentation <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer bg-brand-50/50 hover:bg-brand-50 border-brand-200 hover:border-brand-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaCloudUploadAlt className="w-8 h-8 text-brand-400 mb-2 group-hover:text-brand-600 transition-colors" />
                    <p className="text-sm font-semibold text-gray-600 group-hover:text-brand-700">
                      {formData.resume
                        ? formData.resume.name
                        : "Click to upload resume (PDF)"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">MAX. 5MB</p>
                  </div>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.resume && (
                <p className="text-red-500 text-xs mt-1 font-medium pl-1">
                  {errors.resume}
                </p>
              )}
            </div>
          )}

          {/* Action Area */}
          <div className="pt-6 border-t border-gray-100 mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto ${
                loading
                  ? "bg-brand-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : isEditing && isModified ? (
                <>Update Profile</>
              ) : (
                <>
                  <FaCheck /> Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickApplyModal;
