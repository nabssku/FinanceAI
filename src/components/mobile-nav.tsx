"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Sparkles,
  Receipt,
  Wallet,
  Menu,
  X,
  BarChart3,
  Settings,
  User,
  HelpCircle,
  LogOut
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const mainItems = [
    { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat AI", href: "/chat", icon: Sparkles, highlight: true },
    { name: "Transaksi", href: "/transactions", icon: Receipt },
    { name: "Anggaran", href: "/budgets", icon: Wallet },
  ];

  const overlayItems = [
    { name: "Analisis Keuangan", href: "/analytics", icon: BarChart3 },
    { name: "Pengaturan", href: "/settings", icon: Settings },
    { name: "Profil Pengguna", href: "/profile", icon: User },
    { name: "Bantuan & Info", href: "/help", icon: HelpCircle },
  ];

  return (
    <>
      {/* Overlay Menu for Mobile */}
      <div 
        className={`fixed inset-0 z-50 bg-[#09090B]/80 backdrop-blur-md transition-all duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div 
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#18181B] border-t border-[#27272A] rounded-t-3xl p-6 flex flex-col gap-6 transition-all duration-300 transform ${
            menuOpen ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div className="text-left">
              <h3 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wider">Menu Lainnya</h3>
              <p className="text-[10px] text-[#A1A1AA]">Akses halaman tambahan dan kontrol akun</p>
            </div>
            <button 
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 border border-[#27272A] text-[#A1A1AA] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Additional Links Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {overlayItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex flex-col gap-3 p-4 rounded-xl border text-left transition-all ${
                    isActive 
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" 
                      : "bg-zinc-950/45 border-[#27272A]/50 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-zinc-900/40"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-[#A1A1AA]"}`} />
                  <span className="text-xs font-bold text-white">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User profile details & Logout inside menu drawer */}
          <div className="mt-2 border-t border-[#27272A] pt-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                alt="Profile Avatar"
                className="w-10 h-10 rounded-full object-cover border border-[#27272A] bg-zinc-800"
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-[#FAFAFA] truncate">
                  {session?.user?.name || "Alex Sterling"}
                </p>
                <p className="text-[10px] text-[#A1A1AA] truncate">
                  {session?.user?.email || "alex@example.com"}
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-semibold text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#18181B]/95 backdrop-blur-xl border-t border-[#27272A] z-40 flex items-center justify-around px-4 pb-safe shadow-2xl">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) && !menuOpen;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 text-center relative ${
                isActive 
                  ? item.highlight 
                    ? "text-indigo-400 font-bold" 
                    : "text-[#FAFAFA] font-medium"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA]"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive && item.highlight 
                  ? "bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5 text-indigo-400 scale-105" 
                  : ""
              }`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[9px] tracking-wide font-semibold">{item.name}</span>
              {isActive && !item.highlight && (
                <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
              )}
            </Link>
          );
        })}

        {/* Lainnya (Toggles overlay) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 text-center relative cursor-pointer outline-none border-none bg-transparent ${
            menuOpen ? "text-indigo-400 font-bold" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            menuOpen ? "bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5 text-indigo-400 scale-105" : ""
          }`}>
            <Menu className="w-5 h-5 shrink-0" />
          </div>
          <span className="text-[9px] tracking-wide font-semibold">Lainnya</span>
          {menuOpen && (
            <span className="absolute bottom-1 w-1 h-1 bg-indigo-400 rounded-full animate-ping" />
          )}
        </button>
      </div>
    </>
  );
}
