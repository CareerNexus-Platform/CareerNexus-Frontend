import { parseProfileLinks } from "../../services/profileData";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { motion as Motion } from "framer-motion";
import requestApi from "../../services/request";
import toast from "react-hot-toast";
import { FaArrowLeft, FaSearch, FaDownload, FaFilter } from "react-icons/fa";
import NavbarTpoDashboard from "../../components/NavbarTPODashboard";

const departments = [
  "CSE", "CSE-IT", "CSE-AI", "CSE-AIML", "CSE-DS", "Cyber Security",
  "ECE", "EEE", "MECH", "CIVIL"
];

const platforms = ["LinkedIn", "LeetCode", "HackerRank", "GitHub"];

const TpoStudents = () => {

  const { userId } = useParams();

  const [year, setYear] = useState("");
  const [department, setDepartment] = useState("");
  const [platform, setPlatform] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilter = async () => {

    if (year && department && platform) {

      try {
        const response = await requestApi.get(`/tpo/student/get-profile-links/${year}/${department}`);

        setFilteredData(
          response.data
            .map(student => {
              return parseProfileLinks(student.urls)
                .filter(url => url.platform === platform)
                .map(url => ({
                  id: student.userId,
                  name: student.firstName + ' ' + student.lastName,
                  department: department,
                  profileLink: url.url
                }));
            })
            .flat()
        );
        if (response.data.length === 0) {
          toast.error("No students found for the selected filters.", {
            id: "no-students",
          });
        } else {
          toast.success("Student data fetched successfully!");
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to fetch student data.", {
          id: "fetch-error",
        });
      }

    } else {
      setFilteredData([]);
      toast.error("Please select all filters", {
        id: "select-filters",
      });
    }
  };


  useEffect(() => {
    console.log(filteredData);
  }, [filteredData])
  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map(({ id, name, department, profileLink }) => ({
        ID: id,
        Name: name,
        Department: department,
        "Profile Link": profileLink,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_data.xlsx");
  };

  const filteredSearchResults = filteredData.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="cn-data-page min-h-screen flex flex-col bg-gradient-to-br from-canvas via-paper to-paper text-ink font-outfit">
      <NavbarTpoDashboard />
      <div className="flex-grow pt-28 pb-16 px-4 max-w-7xl mx-auto w-full">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-[2rem] p-6 md:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-brand-500"></div>

          {/* Header & Back */}
          <div className="flex items-center gap-4 mb-2">
            <Link
              to={`/tpo/${userId}/home`}
              className="group flex-shrink-0 flex items-center justify-center w-10 h-10 bg-white border border-brand-200 hover:border-brand-400 rounded-full text-brand-500 hover:text-brand-700 shadow-sm hover:shadow transition-all duration-300"
              title="Back to TPO Home"
            >
              <FaArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
              Explore Student Profiles
            </h2>
          </div>
          <p className="text-muted mb-8 text-lg sm:pl-14">View and download student platform profiles from various departments.</p>

          {/* Dropdown Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 p-6 bg-white/50 border border-brand-100 rounded-2xl shadow-sm">
            <select
              onChange={(e) => setYear(e.target.value)}
              value={year}
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              <option value="">Select Year</option>
              {[1, 2, 3, 4].map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => setDepartment(e.target.value)}
              value={department}
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              <option value="">Select Department</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => setPlatform(e.target.value)}
              value={platform}
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              <option value="">Select Platform</option>
              {platforms.map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>

            <button
              onClick={handleFilter}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-600 text-white rounded-xl shadow-lg hover:from-brand-700 hover:to-brand-700 transition font-bold"
            >
              <FaFilter /> Submit
            </button>
          </div>

          {/* Search & Download */}
          {filteredData.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input aria-label="Search by student name..."
                  type="text"
                  placeholder="Search by student name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white/80 backdrop-blur-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                onClick={handleDownload}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-brand-600 border border-brand-200 rounded-xl hover:bg-brand-50 shadow-sm transition-all font-bold"
              >
                <FaDownload /> Download Excel
              </button>
            </div>
          )}

          {/* Table */}
          {filteredSearchResults.length > 0 ? (
            <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
              <table className="min-w-full text-left">
                <thead className="bg-paper border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Student ID</th>
                    <th className="py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Department</th>
                    <th className="py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wider">Profile Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSearchResults.map((student, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-brand-50/50 transition duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{student.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{student.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{student.department}</td>
                      <td className="py-4 px-6 text-sm">
                        <a
                          href={student.profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-800 font-medium break-all hover:underline"
                        >
                          {student.profileLink}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="text-center bg-white/50 border border-brand-100 rounded-2xl p-12">
              <p className="text-lg text-gray-500 font-medium">
                No students match your search "{searchQuery}".
              </p>
            </div>
          ) : null}
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

export default TpoStudents;
