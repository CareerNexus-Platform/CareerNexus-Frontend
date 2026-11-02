import { parseProfileLinks } from "../../services/profileData";
import React from "react";
import { motion as Motion } from "framer-motion";
import { User, FileDown } from "lucide-react";
import useDialog from '../../hooks/useDialog';
import { assetUrl } from '../../services/apiConfig';

const TPORecruiterModal = ({ student, onClose }) => {
  const dialogRef = useDialog(Boolean(student), onClose);
  if (!student) return null;

  return (
    <Motion.div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 font-outfit"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Motion.div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label="Applicant profile" tabIndex={-1}
        className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl max-w-lg w-full relative overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-brand-500"></div>

        {/* Header */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-brand-100 bg-white/50">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-brand-100 to-brand-100 p-3 rounded-2xl shadow-inner border border-brand-200 text-brand-600">
              <User size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink leading-tight flex items-center gap-2">
                {student.studentFirstName + " " + student.studentLastName}
              </h2>
              <p className="text-sm text-gray-500 font-medium tracking-wide uppercase mt-0.5">
                Applicant Profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close applicant profile"
            className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-gray-700 bg-white/40">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-brand-50 shadow-sm">
              <p className="text-xs text-brand-500 font-bold uppercase tracking-wider mb-1">Branch</p>
              <p className="font-semibold text-gray-800 text-lg">{student.studentDepartment}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-brand-50 shadow-sm">
              <p className="text-xs text-brand-500 font-bold uppercase tracking-wider mb-1">Year</p>
              <p className="font-semibold text-gray-800 text-lg">{student.year}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-50 shadow-sm">
            <p className="text-xs text-brand-500 font-bold uppercase tracking-wider mb-1">Email</p>
            <p className="font-medium text-gray-800 truncate">{student.studentEmail || "Not Available"}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-50 shadow-sm">
            <p className="text-xs text-brand-500 font-bold uppercase tracking-wider mb-3">Profile Links</p>
            <div className="flex flex-wrap gap-2">
              {student.urls && parseProfileLinks(student.urls).map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 font-semibold text-sm rounded-xl border border-brand-100 hover:bg-brand-600 hover:text-white transition-colors shadow-sm"
                >
                  {link.platform}
                </a>
              ))}
              {(!student.urls || parseProfileLinks(student.urls).length === 0) && (
                <p className="text-sm text-gray-500 italic">No links provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-semibold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition shadow-sm"
          >
            Close
          </button>
          <a
            href={assetUrl(student.resume_url || student.appliedResumeUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:from-brand-700 hover:to-brand-700 transition transform hover:-translate-y-0.5"
          >
            <FileDown size={18} />
            View Resume
          </a>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default TPORecruiterModal;
