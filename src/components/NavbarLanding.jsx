import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { FaBars, FaTimes } from "react-icons/fa";

const NavbarLanding = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollLinks = [
    { to: "home", label: "Home" },
    { to: "features", label: "Features" },
    { to: "about", label: "About" },
    { to: "contact", label: "Contact" },
  ];

  const routeLinks = [
    { path: "/student", label: "Student" },
    { path: "/tpo", label: "TPO" },
    { path: "/recruiter", label: "Recruiter" }, // 🔁 changed from 'interviewer'
  ];

  const linkClass =
    "cursor-pointer text-white hover:text-brand-400 transition duration-300 font-poppins tracking-wide";
  const activeClass = "text-brand-400 underline underline-offset-4";

  return (
    <nav className="w-full bg-gradient-to-r from-ink via-ink to-ink fixed top-0 left-0 z-50 shadow-xl">
      <div className="max-w-auto  px-6 py-4 flex items-center justify-between">
        {/* 🔹 Logo */}
        <ScrollLink
          to="home"
          smooth
          duration={600}
          offset={-70}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-10 w-10 drop-shadow-[0_0_12px_rgba(65, 45, 32,0.5)]"
          />
          <span className="text-white text-2xl font-poppins font-semibold tracking-wider drop-shadow-[0_0_8px_rgba(65, 45, 32,0.6)]">
            CareerNexus
          </span>
        </ScrollLink>

        {/* 🖥️ Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-poppins tracking-wide">
          {scrollLinks.map((link) => (
            <ScrollLink
              key={link.to}
              to={link.to}
              smooth={true}
              duration={500}
              offset={-80}
              spy={true}
              className={linkClass}
              activeClass={activeClass}
            >
              {link.label}
            </ScrollLink>
          ))}

          {routeLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? `${linkClass} ${activeClass}` : linkClass
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* 📱 Mobile Toggle */}
        <button
          className="md:hidden text-white text-xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* 📱 Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-ink border-t border-brand-500/20 px-6 py-4 space-y-4 text-base text-white shadow-xl z-50">
          {scrollLinks.map((link) => (
            <ScrollLink
              key={link.to}
              to={link.to}
              smooth={true}
              duration={500}
              offset={-80}
              spy={true}
              className={linkClass}
              activeClass={activeClass}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </ScrollLink>
          ))}

          {routeLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? `${linkClass} ${activeClass}` : linkClass
              }
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavbarLanding;
