import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";
import { Link as ScrollLink } from "react-scroll";
import { NavLink } from "react-router-dom";
import {
  FaArrowRight,
  FaHome,
  FaFileAlt,
  FaChartLine,
  FaBell,
  FaUserGraduate,
  FaCheckCircle,
  FaShieldAlt,
  FaStar
} from "react-icons/fa";
import NavbarStudent from "../../components/NavbarStudent";

const studentFeatures = [
  {
    icon: <FaFileAlt />,
    title: "Resume Builder",
    desc: "Create and update your resumes effortlessly with professional templates.",
    color: "indigo",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    shadow: "shadow-indigo-200"
  },
  {
    icon: <FaUserGraduate />,
    title: "Application Tracker",
    desc: "Track your job applications and manage your progress clearly.",
    color: "violet",
    bg: "bg-violet-50",
    text: "text-violet-600",
    shadow: "shadow-violet-200"
  },
  {
    icon: <FaBell />,
    title: "Live Updates",
    desc: "Get real-time updates on interview schedules and announcements.",
    color: "pink",
    bg: "bg-pink-50",
    text: "text-pink-600",
    shadow: "shadow-pink-200"
  },
  {
    icon: <FaChartLine />,
    title: "Student Dashboard",
    desc: "Access your performance analytics, test scores, and placement stats.",
    color: "emerald",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    shadow: "shadow-emerald-200"
  },
];



const Student = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#F8E5EB] to-[#E4EBFE] text-[#2C225A] scroll-smooth font-poppins overflow-x-hidden">
      <NavbarStudent />

                
                
                
                {/* 🔙 Back to Main Home */}
      <div className="fixed top-[90px] left-3 z-50 hidden md:block">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <NavLink
            to="/"
            className="group flex items-center gap-2.5 px-5 py-2.5 bg-white border border-purple-200 rounded-full text-purple-900 font-bold text-sm shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_15px_rgba(109,40,217,0.15)] hover:border-purple-300 transition-all duration-300 font-outfit"
          >
            <FaHome className="text-purple-600 text-lg group-hover:-translate-y-[2px] transition-transform duration-300" />
            Back to Home
          </NavLink>
        </motion.div>
      </div>



                     
                     
                     
                     {/* 🎓 Student Landing Section */}


      <section className="min-h-screen pt-28 flex items-center">
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Welcome To Student Portal
            </h1>

            <div className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-[#B497FF] drop-shadow-md">
              <Typewriter
                options={{
                  strings: [
                    "Track your placement journey",
                    "Stay organized and ahead",
                    "Ace every opportunity",
                  ],
                  autoStart: true,
                  loop: true,
                }}
              />


            </div>



            <p className="text-[#3f3f5c] mb-8 text-sm sm:text-base md:text-lg">
              The student portal of CareerNexus helps streamline your placement preparation,
              resume updates, and goal tracking all in one powerful interface.
            </p>



            <ScrollLink
              to="student-features"
              smooth={true}
              duration={600}
              offset={-70}
              className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full
              bg-gradient-to-r from-[#b892ff] to-[#411686]
              shadow-[0_0_5px_#b892ff] hover:shadow-[0_0_10px_#b892ff,0_0_20px_#411686]
              transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            >
              Get Started
              <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                <FaArrowRight />
              </span>
            </ScrollLink>
          </motion.div>



          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl overflow-hidden border border-[#cbbfff] shadow-[0_0_25px_rgba(165,100,255,0.25)] hover:shadow-[0_0_45px_rgba(165,100,255,0.5)] transition-all duration-500 hover:scale-[1.04] backdrop-blur-md bg-white/5">
              <img
                src="/images/student.jpeg"
                alt="Student Portal"
                className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-2xl transition duration-300 hover:brightness-110"
              />
            </div>
          </motion.div>
        </div>
      </section>



      
      {/* 🚀 Features Section */}


      <section
        id="student-features"
        className="py-32 relative overflow-hidden bg-gradient-to-b from-[#E4EBFE]/50 to-[#F8E5EB]/50"
      >
        <div className="container mx-auto px-6 sm:px-10 lg:px-20 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-xl">
              <div className="text-indigo-600 font-extrabold text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
                Powerful Toolkit
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#2F2F5B] leading-[1.1] tracking-tighter font-outfit">Student Features</h2>
            </div>
            <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-sm">
              Tools designed to simplify your journey and maximize your placement potential. Everything you need, right at your fingertips.
            </p>
          </div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {studentFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 xl:p-10 rounded-[3rem] hover:bg-white hover:shadow-[0_40px_80px_rgba(130,90,255,0.15)] transition-all duration-500 group relative overflow-hidden"
              >
                <div className={`w-16 h-16 ${feature.bg} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg ${feature.shadow}`}>
                  {React.cloneElement(feature.icon, { size: 28, className: feature.text })}
                </div>
                <h3 className="text-2xl font-black text-[#2F2F5B] mb-4 tracking-tight group-hover:text-indigo-700 transition-colors font-outfit">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-semibold text-sm mb-8">
                  {feature.desc}
                </p>

                
                
                
                
                {/* Decorative background element */}


                <div className={`absolute -bottom-10 -right-10 opacity-[0.03] text-9xl ${feature.text} group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none`}>
                  {feature.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      
      
                        {/* 💼 About Section */}


      <section id="student-about" className="py-24 px-6 bg-gradient-to-b from-[#F8E5EB] to-[#E4EBFE]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white/30 backdrop-blur-2xl border border-white/60 p-12 md:p-16 rounded-[3rem] shadow-2xl text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

            <h2 className="text-4xl md:text-5xl font-black text-[#6B4ECF] mb-8 font-outfit">
              About Student Portal
            </h2>
            <p className="text-[#5C5C80] text-lg md:text-xl leading-relaxed mb-8 font-outfit">
              The CareerNexus student portal is a smart solution tailored for student placement preparation. From resumes to updates to personal progress tracking, we provide everything in one powerful dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-6 font-outfit">
              <div className="bg-white/60 px-6 py-3 rounded-full text-sm font-bold text-[#2F2F5B] shadow-sm border border-white/80">Streamlined</div>
              <div className="bg-white/60 px-6 py-3 rounded-full text-sm font-bold text-[#2F2F5B] shadow-sm border border-white/80">Real-Time Tracker</div>
              <div className="bg-white/60 px-6 py-3 rounded-full text-sm font-bold text-[#2F2F5B] shadow-sm border border-white/80">Goal Oriented</div>
            </div>
          </motion.div>
        </div>
      </section>



      
                              {/* 📍 Footer */}

                              
      <footer className="w-full bg-gradient-to-r from-[#130c22] via-[#1b1435] to-[#0f0c1d] border-t border-violet-500/20 py-8 mt-10">
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 text-center text-[#EADFFD] space-y-2 font-outfit">
          <p className="text-sm sm:text-base opacity-90">
            &copy; {new Date().getFullYear()} CareerNexus. All rights reserved.
          </p>
          <p className="text-xs opacity-60">Your one-stop placement tracker</p>
        </div>
      </footer>
    </div>
  );
};



export default Student;
