// src/pages/admin/AdminAccessForm.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaArrowLeft,
  FaUserTie,
  FaUser,
} from "react-icons/fa";
import { motion as Motion } from "framer-motion";
import requestApi from "../../services/request";
import toast from "react-hot-toast";

const AdminAccessForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { userId: username, email: email, role: role };

    try {
      await requestApi.post("/admin/create-user", payload);
      toast.success("User created and welcome email sent!");
      setTimeout(() => navigate("/admin"), 2000);
    } catch (error) {
      console.error("Error registering user:", error.message);
      toast.error(`Failed to register user. ${error.response?.data?.error || ""}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-11 pr-10 py-3.5 rounded-xl bg-white/80 border border-brand-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all shadow-sm";

  return (
    <div className="cn-form-page min-h-screen bg-gradient-to-br from-brand-50 via-brand-50 to-brand-50 flex items-center justify-center px-4 py-16 font-outfit">
      <Motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/80 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative"
      >
        {/* 🔙 Back Button */}
        <NavLink
          to="/admin"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/90 border border-brand-100/50 hover:border-brand-300 rounded-full text-gray-600 hover:text-brand-700 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-md group z-50"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          Back
        </NavLink>

        {/* 👤 Icon & Title */}
        <div className="flex flex-col items-center mt-6">
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.28, delay: 0.1 }}
            className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-600 rounded-full flex items-center justify-center mb-5 text-white shadow-xl shadow-brand-500/30 text-3xl"
          >
            <FaUserTie />
          </Motion.div>
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-brand-800 to-brand-800 bg-clip-text text-transparent">
            Admin Access
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center font-medium">
            Grant new access in <span className="text-brand-600 font-semibold">CareerNexus</span>
          </p>
          <p className="text-xs text-gray-400 mt-1 italic text-center">Passwords are auto-generated and emailed.</p>
        </div>

        {/* 📄 Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="relative">
            <FaUser className="absolute left-4 top-[1.1rem] text-brand-400 text-lg" />
            <input aria-label="Username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-4 top-[1.1rem] text-brand-400 text-lg" />
            <input aria-label="Email address"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputClasses} pl-4 appearance-none`}
              required
            >
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
              <option value="tpo">TPO</option>
            </select>
            {/* Custom dropdown arrow to match styling */}
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-2 text-brand-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <Motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-4 text-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Grant Access"}
          </Motion.button>
        </form>
      </Motion.div>
    </div>
  );
};

export default AdminAccessForm;
