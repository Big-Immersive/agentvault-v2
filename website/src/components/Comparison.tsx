"use client";

import { Check, X } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const ROWS = [
  { feature: "Open Source (MIT)", av: true, vault: "BSL", env: false, nothing: false },
  { feature: "Local CLI Tool", av: true, vault: false, env: true, nothing: false },
  { feature: "Per-Agent Scoping", av: true, vault: false, env: false, nothing: false },
  { feature: "Trust Levels", av: true, vault: false, env: false, nothing: false },
  { feature: "Credential Redaction", av: true, vault: false, env: false, nothing: false },
  { feature: "Audit Trail", av: true, vault: true, env: false, nothing: false },
  { feature: "Kill Switch", av: true, vault: false, env: false, nothing: false },
  { feature: "Zero Config Start", av: true, vault: false, env: true, nothing: true },
  { feature: "Designed for AI Agents", av: true, vault: false, env: false, nothing: false },
  { feature: "Agent Memory Store", av: true, vault: false, env: false, nothing: false },
  { feature: "MCP Server", av: true, vault: false, env: false, nothing: false },
  { feature: "Memory Marketplace", av: true, vault: false, env: false, nothing: false },
  { feature: "Portable Vault Export", av: true, vault: true, env: false, nothing: false },
  { feature: "Setup Complexity", av: "Minimal", vault: "High", env: "None", nothing: "None" },
];

function Cell({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (value === true) {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${highlight ? "bg-primary/15" : ""}`}>
        <Check className={`w-4 h-4 ${highlight ? "text-primary" : "text-muted"}`} strokeWidth={2.5} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6">
        <X className="w-3.5 h-3.5 text-[#1b0c25]/20" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className={`text-sm ${highlight ? "text-fg font-medium" : "text-muted"}`}>
      {value}
    </span>
  );
}

export function Comparison() {
  const { ref, isVisible } = useInView();

  return (
    <section className="py-16 px-6" id="compare">
      <div className="section-line mb-12" />

      <div className="max-w-4xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${isVisible ? "visible" : ""}`}>
          <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-4">
            Comparison
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-fg mb-6">
            How AgentVault{" "}
            <span className="gradient-text">compares</span>
          </h2>
          <p className="text-lg text-muted">
            Purpose-built for a problem others weren&apos;t designed to solve.
          </p>
        </div>

        <div className={`card-glow !p-0 overflow-hidden reveal ${isVisible ? "visible" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1b0c25]/[0.06]">
                  <th className="text-left py-4 px-6 text-muted font-medium text-xs uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4">
                    <span className="gradient-text font-medium text-sm">AgentVault</span>
                  </th>
                  <th className="text-center py-4 px-4 text-muted font-medium text-xs">
                    HashiCorp Vault
                  </th>
                  <th className="text-center py-4 px-4 text-muted font-medium text-xs">
                    Manual .env
                  </th>
                  <th className="text-center py-4 px-4 text-muted font-medium text-xs">
                    Nothing
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[#1b0c25]/[0.04] hover:bg-[#1b0c25]/[0.02] transition-colors ${
                      i === ROWS.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-3.5 px-6 text-fg text-sm">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Cell value={row.av} highlight />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Cell value={row.vault} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Cell value={row.env} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Cell value={row.nothing} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
