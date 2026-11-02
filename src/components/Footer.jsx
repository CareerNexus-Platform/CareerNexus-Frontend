import React from "react";
import { motion as Motion } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";

const Footer = () => {
  const scrollLinks = [
    { to: "home", label: "Home" },
    { to: "features", label: "Features" },
    { to: "about", label: "About" },
    { to: "contact", label: "Contact" },
  ];

  return (
    <Motion.footer
      className="bg-gradient-to-r from-ink via-ink to-ink border-t border-brand-500/20 text-paper"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      viewport={{ once: true }}
    >
      <div className="w-full px-6 sm:px-10 md:px-24 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.svg"
            alt="CareerNexus Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold tracking-wide drop-shadow-[0_0_8px_rgba(65, 45, 32,0.5)]">
            CareerNexus
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium tracking-wide text-paper/80">
          {scrollLinks.map((link) => (
            <ScrollLink
              key={link.to}
              to={link.to}
              smooth={true}
              duration={500}
              offset={-70}
              className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-colors"
            >
              {link.label}
            </ScrollLink>
          ))}
        </nav>

        {/* Rights */}
        <p className="text-xs text-paper/60 text-center md:text-right w-full md:w-auto">
          © {new Date().getFullYear()} CareerNexus. All rights reserved.
        </p>
      </div>
    </Motion.footer>
  );
};

export default Footer;
