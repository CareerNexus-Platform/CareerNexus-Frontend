import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { FaBars, FaTimes } from "react-icons/fa";

const NavbarRecruiter = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollLinks = [
    { to: "recruiter-home", label: "Home" },
    { to: "recruiter-features", label: "Features" },
    { to: "recruiter-about", label: "About" },
  ];

  const linkClass =
    "cursor-pointer hover:text-brand-400 transition duration-300 font-poppins";
  const activeClass = "text-brand-400 underline underline-offset-4";

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-gradient-to-r from-ink via-ink to-ink shadow-md">
      <div className="max-w-auto px-6 py-4 flex items-center justify-between">
        {/* 🔹 Logo with Glow */}
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src="/images/logo.svg"
            alt="CareerNexus Logo"
            className="h-9 w-auto"
          />
          <span className="text-white text-2xl font-poppins font-semibold tracking-wider drop-shadow-[0_0_8px_rgba(65, 45, 32,0.6)]">
            CareerNexus
          </span>
        </NavLink>

        {/* 🖥️ Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-white text-base font-poppins">
          {scrollLinks.map((link) => (
            <ScrollLink
              key={link.to}
              to={link.to}
              smooth={true}
              duration={500}
              offset={-80}
              spy={true}
              activeClass={activeClass}
              className={linkClass}
            >
              {link.label}
            </ScrollLink>
          ))}

          {/* ✨ Login Button Only */}
          <NavLink
            to="/recruiter/login"
            className="ml-4 px-4 py-2 rounded-md bg-white/10 text-white border border-brand-400 hover:bg-brand-500 hover:text-white transition duration-300 shadow-[0_0_10px_rgba(65, 45, 32,0.4)] hover:shadow-[0_0_20px_rgba(65, 45, 32,0.6)]"
          >
            Login
          </NavLink>
        </div>

        {/* 📱 Mobile Toggle */}
        <div className="md:hidden text-white text-xl">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-ink px-6 pb-6 space-y-4 text-white text-base font-poppins">
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

          <NavLink
            to="/recruiter/login"
            className="block px-4 py-2 rounded-md bg-white/10 text-white border border-brand-400 hover:bg-brand-500 hover:text-white transition duration-300 shadow-[0_0_12px_rgba(65, 45, 32,0.6)]"
            onClick={() => setIsOpen(false)}
          >
            Login
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default NavbarRecruiter;
