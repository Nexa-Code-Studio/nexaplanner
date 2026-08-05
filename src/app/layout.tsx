import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/hooks/use-auth";

export const metadata: Metadata = {
  title: "NexaPlanner - NexaCode Internal Event Timeline",
  description: "Internal planning and event management platform for NexaCode teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
