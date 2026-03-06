"use client";

import { ArrowRight, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useInView } from "@/hooks/useInView";

export function CTA() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { ref, isVisible } = useInView();

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install -g agentvault");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 px-6 relative" id="get-started">
      <div className="section-line mb-12" />

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1 top-[30%] left-[30%]" />
        <div className="orb orb-2 top-[50%] right-[20%]" />
      </div>

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto text-center">
        <div className={`reveal ${isVisible ? "visible" : ""}`}>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-fg mb-6">
            Take control of your{" "}
            <span className="gradient-text">agent&apos;s access</span>
          </h2>
          <p className="text-lg text-muted mb-10">
            Install AgentVault in seconds. Free, open source, MIT licensed.
          </p>
        </div>

        {/* Install command */}
        <div className={`reveal ${isVisible ? "visible" : ""}`} style={{ transitionDelay: "100ms" }}>
          <button
            onClick={handleCopy}
            className="group inline-flex items-center gap-4 terminal-glow rounded-xl px-6 py-4 bg-code-bg border border-[#1b0c25]/10 hover:border-primary/30 transition-all cursor-pointer mb-10"
          >
            <code className="font-[family-name:var(--font-mono)] text-primary text-sm">
              npm install -g agentvault
            </code>
            <span className="text-[#666] group-hover:text-white transition-colors">
              {copied ? (
                <span className="text-trust-green text-xs font-sans">Copied!</span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </span>
          </button>
        </div>

        {/* CTAs */}
        <div className={`flex flex-wrap justify-center gap-4 mb-16 reveal ${isVisible ? "visible" : ""}`} style={{ transitionDelay: "200ms" }}>
          <a href="https://github.com/agentvault/agentvault" className="btn-primary inline-flex items-center gap-2 text-lg">
            Star on GitHub
            <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#enterprise" className="btn-secondary text-lg">
            Enterprise Waitlist →
          </a>
        </div>

        {/* Enterprise waitlist */}
        <div className={`card-glow p-10 reveal ${isVisible ? "visible" : ""}`} style={{ transitionDelay: "300ms" }} id="enterprise">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-fg mb-3">
            Enterprise Early Access
          </h3>
          <p className="text-muted text-sm mb-8">
            SSO, team management, compliance reporting, and more. Join the waitlist.
          </p>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-trust-green/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-trust-green" />
              </div>
              <p className="text-fg font-medium">You&apos;re on the list!</p>
              <p className="text-muted text-sm">We&apos;ll reach out to <strong className="text-fg">{email}</strong> when early access is ready.</p>
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => {
              e.preventDefault();
              if (email.trim() && email.includes("@")) {
                setSubmitted(true);
              }
            }}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 bg-white border border-[#1b0c25]/10 rounded-xl text-fg placeholder:text-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <button type="submit" className="btn-primary !py-3 whitespace-nowrap">
                Join Waitlist
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
