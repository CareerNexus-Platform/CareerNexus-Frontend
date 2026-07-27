import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaFileUpload, FaCloudUploadAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import requestApi from "../../services/request";
import getuserId from "../../services/getUserId";

const branches = [
  "CSE",
  "CSE-AI",
  "CSE-DS",
  "CSE-AIML",
  "CSE-CS",
  "CSE-IT",
  "ECE",
  "EEE",
  "CIVIL",
  "MECH",
];

const ShareResource = ({ onShare, onClose }) => {
  const userId = getuserId();
  const [formData, setFormData] = useState({
    year: "",
    semester: "",
    regulation: "",
    branch: "",
    subject: "",
    description: "",
    pdfFile: null,
    videoLink: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);



 
 
                             // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "pdfFile") {
      setFormData({ ...formData, pdfFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, pdfFile: e.dataTransfer.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.pdfFile) {
      toast.error("Please enter subject and upload a PDF.", {
        id: "missing-fields",
      });
      return;
    }



    try {
      setIsLoading(true);

      const uploadData = new FormData();

      uploadData.append("file", formData.pdfFile);
      uploadData.append("title", formData.subject);
      uploadData.append("description", formData.description);
      uploadData.append("year", formData.year);
      uploadData.append("semester", formData.semester);
      uploadData.append("regulation", formData.regulation);
      uploadData.append("branch", formData.branch);
      uploadData.append("resourceLink", formData.videoLink);
      uploadData.append("userId", userId);

      await requestApi.post(`/resources/upload`, uploadData);

      toast.success("Resource uploaded successfully!", {
        id: "upload-success",
      });

      setFormData({
        year: "",
        semester: "",
        regulation: "",
        branch: "",
        subject: "",
        description: "",
        pdfFile: null,
        videoLink: "",
      });

      if (onShare) onShare();
      onClose();                  // Close modal after success
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data || "Failed to upload resource.", {
        id: "upload-error",
      });
    } finally {
      setIsLoading(false);
    }
  };





  const inputClasses =
    "w-full bg-white/60 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none p-2.5 transition-all hover:bg-white/90 shadow-sm backdrop-blur-md";

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto scrollbar-hide relative flex flex-col font-poppins">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200/50 sticky top-0 bg-white/70 backdrop-blur-xl z-20">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Share Academic Resource
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Help the community by sharing material.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all"
          >
            <FaTimes size={18} />
          </button>
        </div>




                              
                              {/* Form */}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          
                          {/* Grid for Dropdowns - 4 columns on md screens to save vertical space */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase ml-1">
                Year
              </label>
              <select
                name="year"
                onChange={handleChange}
                value={formData.year}
                required
                className={inputClasses}
              >
                <option value="">Select Year</option>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>
                    {y === 1
                      ? "1st"
                      : y === 2
                        ? "2nd"
                        : y === 3
                          ? "3rd"
                          : "4th"}{" "}
                    Year
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase ml-1">
                Semester
              </label>
              <select
                name="semester"
                onChange={handleChange}
                value={formData.semester}
                required
                className={inputClasses}
              >
                <option value="">Select Sem</option>
                {["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"].map(
                  (sem) => (
                    <option key={sem} value={sem}>
                      Sem {sem}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase ml-1">
                Regulation
              </label>
              <select
                name="regulation"
                onChange={handleChange}
                value={formData.regulation}
                required
                className={inputClasses}
              >
                <option value="">Regulation</option>
                <option value="R20">R20</option>
                <option value="R23">R23</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase ml-1">
                Branch
              </label>
              <select
                name="branch"
                onChange={handleChange}
                value={formData.branch}
                required
                className={inputClasses}
              >
                <option value="">Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>




                              {/* Texts inputs - 2 columns */}


                              
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase ml-1">
                Subject Name
              </label>
              <input
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
                required
                className={inputClasses}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase ml-1">
                Video / Drive Link (Optional)
              </label>
              <input
                name="videoLink"
                type="text"
                value={formData.videoLink}
                onChange={handleChange}
                placeholder="https://..."
                className={inputClasses}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase ml-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe what this resource covers..."
              rows={2}
              className={`${inputClasses} resize-none`}
            />
          </div>




                                  {/* Upload Area */}
          <div
            className={`w-full border-2 border-dashed ${
              dragActive
                ? "border-purple-500 bg-purple-50/80 scale-[1.01]"
                : "border-gray-300 bg-white/50 hover:bg-white/80 hover:border-purple-300"
            } rounded-2xl h-24 flex flex-col items-center justify-center transition-all cursor-pointer`}
          >
            <label
              htmlFor="pdfFile"
              className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center px-4"
            >
              {formData.pdfFile ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-green-100 p-2 rounded-full text-green-600 shadow-sm">
                    <FaCloudUploadAlt size={20} />
                  </div>
                  <span className="text-green-700 font-semibold text-sm truncate max-w-full">
                    {formData.pdfFile.name}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-gray-500">
                  <div className="bg-purple-100 p-2 rounded-full text-purple-600 shadow-sm transition-transform">
                    <FaCloudUploadAlt size={20} />
                  </div>
                  <p className="text-sm font-medium">
                    Drag & Drop PDF or{" "}
                    <span className="text-purple-600 underline decoration-purple-300">
                      Browse
                    </span>
                  </p>
                </div>
              )}
            </label>
            <input
              id="pdfFile"
              name="pdfFile"
              type="file"
              accept="application/pdf"
              onChange={handleChange}
              className="hidden"
            />
          </div>



                        {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <>
                <FaFileUpload size={16} /> Upload Resource
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );


  

  // Render the modal into document.body to ensure it completely overlays the navbar and evades parent stacking context
  return ReactDOM.createPortal(modalContent, document.body);
};

export default ShareResource;
