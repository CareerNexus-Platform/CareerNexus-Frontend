// src/components/LoadingSpinner.jsx
import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// Animation variants for the backdrop
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Animation variants for the spinner container
const spinnerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
};

/**
 * A reusable loading spinner component with a backdrop and animations.
 * Use it to indicate ongoing processes in your application.
 *
 * @param {Object} props - Component props
 * @param {boolean} [props.isLoading=true] - Controls the visibility of the spinner.
 * @param {string} [props.message="Loading..."] - Optional message to display below the spinner.
 */
const Loading= ({ isLoading = true, message = "Loading..." }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <Motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Semi-transparent dark overlay */}
          <div className="absolute inset-0 bg-gray-950 bg-opacity-80 backdrop-blur-sm"></div>

          {/* Spinner content */}
          <Motion.div
            className="relative bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center justify-center gap-4 border border-gray-700"
            variants={spinnerVariants}
          >
            {/* SVG Spinner Animation */}
            <svg
              className="animate-spin h-12 w-12 text-brand-500"
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
            {/* Optional message */}
            {message && <p className="text-white text-lg font-semibold">{message}</p>}
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
