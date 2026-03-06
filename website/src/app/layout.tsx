import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentVault — Encrypted Agent Credential & Memory Vault with MCP",
  description:
    "Encrypt, scope, and audit AI agent access to credentials and memories. Built-in MCP server, memory marketplace, and portable vault format. Open source CLI.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
