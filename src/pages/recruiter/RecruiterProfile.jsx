import ProfileNotice from "../../components/ProfileNotice";
import { apiErrorMessage } from "../../services/apiConfig";
import ProfileField from "../../components/ProfileField";
// src/pages/recruiter/RecruiterProfile.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import toast from "react-hot-toast";
import requestApi from "../../services/request";
import getuserId from "../../services/getUserId";
import {
  FaArrowLeft,
  FaUserEdit,
  FaSave,
  FaCamera,
  FaUser,
  FaPhoneAlt,
  FaBuilding,
  FaIdBadge,
  FaEnvelope,
} from "react-icons/fa";

const RecruiterProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pageMode = query.get("page") || "update"; // either "data" or "update"
  const userId = getuserId(); // Get userId from localStorage or context

  const [isEditing, setIsEditing] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [profileImage, setProfileImage] = useState("/images/profile.png");
  const [imageFile, setImageFile] = useState(null);
  const emailfromUrl = query.get("email");
  const userIdFromUrl = query.get("userId");

  const [recruiter, setRecruiter] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    company: "",
    designation: "",
    phone: "",
    email: emailfromUrl || "",
  });

  useEffect(() => {
    if (pageMode === "data") {
      setIsEditing(true);
      setRecruiter((prev) => ({
        ...prev,
        userId: userIdFromUrl || userId,
      }));

      toast("Please complete your profile details.", {
        id: "fill-details",
        icon: "ℹ️",
      });
    } else if (pageMode === "update") {
      setIsEditing(false);
      const data = requestApi.get(`/recruiter/profile`);
      data
        .then((response) => {
          const recruiterData = response.data;
          setRecruiter({
            firstName: recruiterData.firstName || "",
            lastName: recruiterData.lastName || "",
            userId: recruiterData.userId || userIdFromUrl || userId,
            designation: recruiterData.designation || "",
            email: emailfromUrl || recruiterData.email || "",
            phone: recruiterData.phone || "",
            company: recruiterData.company || "",
          });
          if (recruiterData.img_loc) {
            setProfileImage(`${recruiterData.img_loc}`);
          }
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            setNeedsSetup(true);
            setIsEditing(true);
            setRecruiter((previous) => ({
              ...previous,
              userId,
              email: emailfromUrl || previous.email,
            }));
          } else setLoadError(apiErrorMessage(error));
        });
    }
  }, [pageMode, userId, navigate, emailfromUrl, userIdFromUrl]);

  const handleChange = (e) => {
    setRecruiter({ ...recruiter, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => setIsEditing(true);

  const handleSave = async () => {
    // Only check required fields, we won't strictly enforce but check basics
    const requiredFields = [
      "firstName",
      "lastName",
      "company",
      "designation",
      "phone",
    ];
    const allFilled = requiredFields.every(
      (key) => recruiter[key] && recruiter[key].trim() !== "",
    );

    if (!allFilled) {
      toast.error("Please fill all required details", {
        id: "fill-all-details",
      });
      return;
    }

    try {
      const payload = {
        firstName: recruiter.firstName,
        lastName: recruiter.lastName,
        company: recruiter.company,
        designation: recruiter.designation,
        phone: recruiter.phone,
        userId: recruiter.userId || userIdFromUrl,
        email: emailfromUrl || recruiter.email,
      };

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      await requestApi.post(`/recruiter/profile`, formData);

      toast.success(
        pageMode === "data"
          ? "Profile saved successfully!"
          : "Profile updated successfully!",
        { id: "profile-save-success" },
      );

      setIsEditing(false);
      setNeedsSetup(false);

      if (pageMode === "data" || needsSetup) {
        setTimeout(() => {
          navigate(`/recruiter/${userId}/home`);
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || "Failed to save profile", {
        id: "save-error",
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="cn-profile-page min-h-screen flex flex-col">
      {/* Absolute Header Navigation */}
      <ProfileNotice
        setup={needsSetup || pageMode === "data"}
        error={loadError}
      />
      <div className="cn-profile-back">
        <button
          onClick={() => navigate(`/recruiter/${userId}/home`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/60 hover:bg-white/90 border border-brand-100/50 hover:border-brand-300 rounded-full text-gray-600 hover:text-brand-700 font-semibold shadow-sm transition-all duration-300 backdrop-blur-md group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
          Back to Dashboard
        </button>
      </div>

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
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white relative z-10 mt-10 group cursor-pointer transition-transform hover:translate-y-[-1px]">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />

              {isEditing && (
                <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <FaCamera size={24} className="mb-1" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Change
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
              {isEditing && profileImage === "/images/profile.png" && (
                <div className="absolute bottom-0 right-0 p-2 bg-brand-600 rounded-full text-white border-2 border-white shadow-md">
                  <FaCamera size={14} />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="text-center mt-5 mb-6 w-full relative z-10">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {recruiter.firstName || recruiter.lastName
                  ? `${recruiter.firstName} ${recruiter.lastName}`
                  : "Recruiter Name"}
              </h1>
              <p className="text-brand-600 font-semibold text-sm bg-brand-50 inline-block px-3 py-1 rounded-full border border-brand-100 mb-2">
                User ID: {recruiter.userId || "N/A"}
              </p>
              <p className="text-gray-500 text-sm">
                {recruiter.designation || "Recruiter"}
              </p>
              <p className="text-gray-500 text-sm font-medium mt-1">
                {recruiter.company || "Company"}
              </p>
            </div>

            {/* Edit/Save Button */}
            <button
              onClick={() => (isEditing ? handleSave() : handleEditToggle())}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold shadow-md transition-all duration-300 ${
                isEditing
                  ? "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-200/50"
                  : "bg-gray-900 hover:bg-gray-800 text-white shadow-gray-200/50"
              }`}
            >
              {isEditing ? (
                <>
                  <FaSave /> Save Profile
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
                record={recruiter}
                editing={isEditing}
                onChange={handleChange}
                label="User ID"
                name="userId"
                disabled={true}
                icon={<FaIdBadge />}
              />
              <div className="hidden md:block"></div>
              <ProfileField
                record={recruiter}
                editing={isEditing}
                onChange={handleChange}
                label="First Name"
                name="firstName"
              />
              <ProfileField
                record={recruiter}
                editing={isEditing}
                onChange={handleChange}
                label="Last Name"
                name="lastName"
              />
              <ProfileField
                record={recruiter}
                editing={isEditing}
                onChange={handleChange}
                label="Email Address"
                name="email"
                type="email"
                icon={<FaEnvelope />}
                disabled={pageMode === "update"}
              />
              <ProfileField
                record={recruiter}
                editing={isEditing}
                onChange={handleChange}
                label="Phone Number"
                name="phone"
                type="tel"
                icon={<FaPhoneAlt />}
              />
            </div>
          </div>

          {/* Section 2: Professional Details */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-100 flex items-center justify-center text-brand-600 shadow-sm border border-white">
                <FaBuilding size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Professional Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <ProfileField
                record={recruiter}
                editing={isEditing}
                onChange={handleChange}
                label="Company Name"
                name="company"
                icon={<FaBuilding />}
              />
              <ProfileField
                record={recruiter}
                editing={isEditing}
                onChange={handleChange}
                label="Designation"
                name="designation"
                icon={<FaIdBadge />}
              />
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};
export default RecruiterProfile;
