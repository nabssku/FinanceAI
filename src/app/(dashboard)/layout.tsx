import React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { getSettings } from "@/app/actions/settings-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const theme = settings?.theme || "dark";

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-all duration-300 ${
      theme === "glass" 
        ? "bg-gradient-to-br from-[#0c0d12] via-[#121420] to-[#09090b] text-[#FAFAFA]" 
        : "bg-[#09090B] text-[#FAFAFA]"
    }`}>
      {/* Sidebar navigation */}
      <Sidebar theme={theme} />
      
      {/* Main dashboard content workspace */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top metrics dashboard header */}
        <Navbar theme={theme} />
        
        {/* Scrollable interior workspace */}
        <main className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${
          theme === "glass" ? "bg-transparent" : "bg-[#09090B]"
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
