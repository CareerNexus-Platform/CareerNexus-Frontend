import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { FaUserPlus, FaEnvelope, FaUserTag, FaIdCard, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import requestApi from "../../services/request";
import toast from "react-hot-toast";

const AdminCreateUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userId: "",
        email: "",
        role: "student"
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const roles = [
        { id: "student", label: "Student", desc: "Access to jobs and exams" },
        { id: "recruiter", label: "Recruiter", desc: "Manage jobs and candidates" },
        { id: "tpo", label: "TPO", desc: "Placement coordination" }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestApi.post("/admin/create-user", formData);
            toast.success("User created and welcome email sent!");
            setSuccess(true);
            setTimeout(() => navigate("/admin"), 2000);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to create user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cn-form-page min-h-screen bg-gradient-to-br from-paper to-line flex items-center justify-center p-6 font-outfit">
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
            >
                {/* Header */}
                <div className="cn-admin-form-header bg-gradient-to-r from-brand-600 to-brand-600 p-10 text-white text-center relative">
                    <button
                        aria-label="Back to admin overview"
                        onClick={() => navigate("/admin")}
                        className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors"
                    >
                        <FaArrowLeft size={20} />
                    </button>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg">
                        <FaUserPlus />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create New User</h1>
                    <p className="text-brand-100 mt-2 font-medium">Automatic password generation & email notification</p>
                </div>

                {/* Form */}
                <div className="p-10">
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-6">
                                {/* User ID */}
                                <div>
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 block">Username / ID</label>
                                    <div className="relative group">
                                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                                        <input aria-label="user Id"
                                            type="text"
                                            name="userId"
                                            value={formData.userId}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. jdoe2024"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 block">Email Address</label>
                                    <div className="relative group">
                                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                                        <input aria-label="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="user@example.com"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700"
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 block">Assign Role</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {roles.map((role) => (
                                            <label
                                                key={role.id}
                                                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                    formData.role === role.id
                                                    ? 'bg-brand-50 border-brand-500 shadow-md ring-4 ring-brand-500/10'
                                                    : 'bg-white border-gray-100 hover:border-brand-200'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    className="sr-only"
                                                    value={role.id}
                                                    checked={formData.role === role.id}
                                                    onChange={handleChange}
                                                />
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                                                     formData.role === role.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 shadow-inner'
                                                }`}>
                                                    <FaUserTag />
                                                </div>
                                                <div className="ml-4">
                                                    <p className={`font-black tracking-tight ${formData.role === role.id ? 'text-brand-900' : 'text-gray-700'}`}>{role.label}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{role.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-brand-600 to-brand-600 text-white font-semibold py-3.5 rounded-[1.25rem] shadow-xl hover:shadow-2xl hover:translate-y-[-1px] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-sm"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Create & Send Email <FaCheckCircle /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-10">
                            <Motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl"
                            >
                                <FaCheckCircle />
                            </Motion.div>
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Registration Successful!</h2>
                            <p className="text-gray-500 font-medium mb-8">The welcome email with credentials is on its way.</p>
                            <p className="text-xs text-gray-400 italic">Redirecting you back to dashboard...</p>
                        </div>
                    )}
                </div>
            </Motion.div>
        </div>
    );
};

export default AdminCreateUser;
