"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Github, Menu, X } from "lucide-react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Compare", href: "/#compare" },
  { label: "Documentation", href: "/documentation" },
];

const SPEC_LINK = { label: "ACSS Standard", href: "/acss" };

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out ${
      scrolled ? "pt-3 px-4 md:px-8" : "pt-3 px-4 md:px-6"
    }`}>
      <nav
        className={`transition-all duration-500 ease-out w-full bg-white/50 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full ${
          scrolled
            ? "max-w-5xl"
            : "max-w-[1400px]"
        }`}
      >
        <div className={`mx-auto flex items-center justify-between transition-all duration-500 ${
          scrolled ? "px-5 h-12" : "px-6 h-14"
        }`}>
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <Image src="/logo.svg" alt="AgentVault" width={scrolled ? 26 : 32} height={scrolled ? 26 : 32} className="rounded-lg transition-all duration-500" />
            <span className={`font-[family-name:var(--font-heading)] font-medium text-fg tracking-tight transition-all duration-500 ${
              scrolled ? "text-base" : "text-lg"
            }`}>
              AgentVault
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-fg font-medium"
                    : "text-[#1b0c25]/60 hover:text-fg"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href={SPEC_LINK.href}
              className={`text-sm font-medium px-3 py-1 rounded-full transition-colors duration-200 ${
                isActive(SPEC_LINK.href)
                  ? "text-white bg-primary border border-primary"
                  : "text-primary border border-primary/25 bg-primary/[0.06] hover:bg-primary/[0.12]"
              }`}
            >
              {SPEC_LINK.label}
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com/Big-Immersive/agentvault-v2"
              className="flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a href="#get-started" className={`btn-primary text-sm transition-all duration-500 ${
              scrolled ? "!py-2 !px-4" : "!py-2.5 !px-5"
            }`}>
              Get Started
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-muted hover:text-fg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={`absolute md:hidden bg-white/60 backdrop-blur-2xl border border-white/40 px-6 py-4 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl transition-all duration-500 ${
          scrolled ? "top-[60px] left-4 right-4 md:left-8 md:right-8" : "top-[68px] left-4 right-4 md:left-6 md:right-6"
        }`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`block text-sm transition-colors py-2 ${
                isActive(link.href) ? "text-fg font-medium" : "text-muted hover:text-fg"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={SPEC_LINK.href}
            className="block text-sm font-medium text-primary text-center border border-primary/25 bg-primary/[0.06] py-2 rounded-lg hover:bg-primary/[0.12] transition-colors mt-2"
            onClick={() => setMobileOpen(false)}
          >
            {SPEC_LINK.label}
          </a>
          <a
            href="#get-started"
            className="block btn-primary text-center text-sm !py-2.5 mt-2"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </a>
        </div>
      )}
    </div>
  );
}
