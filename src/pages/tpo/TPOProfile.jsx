import ProfileNotice from "../../components/ProfileNotice";
import { apiErrorMessage } from "../../services/apiConfig";
import ProfileField from "../../components/ProfileField";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import NavbarTPODashboard from "../../components/NavbarTPODashboard";
import toast from "react-hot-toast";
import requestApi from "../../services/request";
import getuserId from "../../services/getUserId";
import {
  FaArrowLeft,
  FaUserEdit,
  FaSave,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

const TPOProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pageMode = query.get("page") || "update";

  const userId = getuserId();

  const [isEditing, setIsEditing] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const emailfromUrl = query.get("email") || "";

  const [tpo, setTpo] = useState({
    userId: userId || "",
    firstName: "",
    lastName: "",
    phone: "",
    email: emailfromUrl || "",
  });

  useEffect(() => {
    if (pageMode === "data") {
      setIsEditing(true);
      toast("Please complete your profile details.", {
        id: "fill-details",
        icon: "ℹ️",
      });
    } else if (pageMode === "update") {
      setIsEditing(false);
      requestApi
        .get(`/tpo/profile`)
        .then((res) => {
          const r = res.data;
          setTpo({
            userId: r.userId || userId,
            firstName: r.firstName || "",
            lastName: r.lastName || "",
            phone: r.phone || "",
            email: r.email || emailfromUrl || "",
          });
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            setNeedsSetup(true);
            setIsEditing(true);
          } else setLoadError(apiErrorMessage(error));
        });
    }
  }, [pageMode, userId, emailfromUrl]);

  const handleChange = (e) =>
    setTpo({ ...tpo, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const allFilled = Object.values(tpo).every((v) => v.trim() !== "");
    if (!allFilled) {
      toast.error("All fields are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: tpo.firstName,
        lastName: tpo.lastName,
        phone: tpo.phone,
        userId: tpo.userId,
        email: tpo.email,
      };

      await requestApi.post(`/tpo/profile`, payload);

      toast.success(
        pageMode === "data" ? "Profile saved!" : "Profile updated!",
        { id: "profile-save-success" },
      );

      setIsEditing(false);
      setNeedsSetup(false);

      if (pageMode === "data" || needsSetup) {
        setTimeout(() => navigate(`/tpo/${userId}/home`), 2000);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cn-profile-page min-h-screen bg-gradient-to-br from-brand-50 via-brand-50 to-brand-50 font-outfit flex flex-col">
      {/* Absolute Header Navigation */}
      <ProfileNotice
        setup={needsSetup || pageMode === "data"}
        error={loadError}
        setupDescription="Add your name and contact details below so your placement team can recognize you."
      />
      <div className="cn-profile-back">
        <button
          onClick={() => navigate(`/tpo/${userId}/home`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/60 hover:bg-white/90 border border-brand-100/50 hover:border-brand-300 rounded-full text-gray-600 hover:text-brand-700 font-semibold shadow-sm transition-all duration-300 backdrop-blur-md group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
          Back to Dashboard
        </button>
      </div>

      <div className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex justify-center pt-24 w-full">
        {/* Main Container: Split Layout */}
        <Motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-6xl cn-profile-layout flex flex-col lg:flex-row gap-6 sm:gap-8"
        >
          {/* Left Sidebar (Sticky) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl p-8 flex flex-col items-center relative overflow-hidden lg:sticky lg:top-24">
              {/* Background Accent */}
              <div className="cn-profile-accent absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-500 to-brand-500"></div>

              {/* Profile Image */}
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white relative z-10 mt-10 ">
                <img
                  src="/images/profile.png"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="text-center mt-5 mb-6 w-full relative z-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {tpo.firstName || tpo.lastName
                    ? `${tpo.firstName} ${tpo.lastName}`
                    : "TPO Name"}
                </h1>
                <p className="text-brand-600 font-semibold text-sm bg-brand-50 inline-block px-3 py-1 rounded-full border border-brand-100 mb-2">
                  User ID: {tpo.userId || "N/A"}
                </p>
                <p className="text-gray-500 text-sm">Placement Officer</p>
              </div>

              {/* Edit/Save Button */}
              <button
                disabled={saving}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold shadow-md transition-all duration-300 ${
                  isEditing
                    ? "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-200/50"
                    : "bg-gray-900 hover:bg-gray-800 text-white shadow-gray-200/50"
                }`}
              >
                {isEditing ? (
                  <>
                    <FaSave /> {saving ? "Saving…" : "Save Profile"}
                  </>
                ) : (
                  <>
                    <FaUserEdit /> Edit Profile Details
                  </>
                )}
              </button>

              {isEditing && pageMode === "update" && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full mt-3 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Right Content Area (Scrollable Info) */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6 sm:gap-8">
            {/* Section 1: Personal Details */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-100 flex items-center justify-center text-brand-600 shadow-sm border border-white">
                  <FaUser size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Personal Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ProfileField
                  record={tpo}
                  editing={isEditing}
                  onChange={handleChange}
                  label="User ID"
                  name="userId"
                  disabled={true}
                />
                <div className="hidden md:block"></div>{" "}
                {/* Spacer for alignment */}
                <ProfileField
                  record={tpo}
                  editing={isEditing}
                  onChange={handleChange}
                  label="First Name"
                  name="firstName"
                />
                <ProfileField
                  record={tpo}
                  editing={isEditing}
                  onChange={handleChange}
                  label="Last Name"
                  name="lastName"
                />
                <ProfileField
                  record={tpo}
                  editing={isEditing}
                  onChange={handleChange}
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={<FaEnvelope />}
                />
                <ProfileField
                  record={tpo}
                  editing={isEditing}
                  onChange={handleChange}
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  icon={<FaPhoneAlt />}
                />
              </div>
            </div>
          </div>
        </Motion.div>
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

export default TPOProfile;
