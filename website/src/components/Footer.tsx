import { Github } from "lucide-react";
import Image from "next/image";

const LINKS = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Compare", href: "/#compare" },
    { label: "Memory", href: "/#features" },
    { label: "MCP Server", href: "/#features" },
    { label: "Enterprise", href: "/#enterprise" },
  ],
  Resources: [
    { label: "ACSS Standard", href: "/acss" },
    { label: "Documentation", href: "/documentation" },
    { label: "GitHub", href: "https://github.com/Big-Immersive/agentvault-v2" },
    { label: "Changelog", href: "https://github.com/Big-Immersive/agentvault-v2/releases" },
  ],
  Community: [
    { label: "Discord", href: "#" },
    { label: "Twitter/X", href: "#" },
    { label: "GitHub Discussions", href: "https://github.com/Big-Immersive/agentvault-v2/discussions" },
    { label: "Contributing", href: "https://github.com/Big-Immersive/agentvault-v2/blob/main/CONTRIBUTING.md" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-steel-blue pt-16 pb-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.svg" alt="AgentVault" width={28} height={28} className="rounded-lg" />
              <span className="font-[family-name:var(--font-heading)] font-medium text-fg tracking-tight">
                AgentVault
              </span>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-4">
              Encrypted Agent Credential &amp; Memory Vault.
              <br />
              Open source. MIT licensed.
            </p>
            <a
              href="https://github.com/Big-Immersive/agentvault-v2"
              className="inline-flex items-center gap-2 text-muted hover:text-fg transition-colors text-sm"
            >
              <Github className="w-4 h-4" />
              <span>Star on GitHub</span>
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-medium text-fg mb-4 text-xs uppercase tracking-widest">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted hover:text-fg text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#1b0c25]/[0.08] text-center text-[#1b0c25]/60 text-xs">
          © {new Date().getFullYear()} AgentVault. Open source under MIT License.
        </div>
      </div>
    </footer>
  );
}
