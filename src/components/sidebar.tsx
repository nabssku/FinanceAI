'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Sparkles,
  Receipt,
  BarChart3,
  Wallet,
  Settings,
  User,
  HelpCircle,
  LogOut,
  WalletCards
} from "lucide-react";

export function Sidebar({ theme }: { theme?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat AI", href: "/chat", icon: Sparkles, highlight: true },
    { name: "Transaksi", href: "/transactions", icon: Receipt },
    { name: "Analisis", href: "/analytics", icon: BarChart3 },
    { name: "Anggaran", href: "/budgets", icon: Wallet },
    { name: "Pengaturan", href: "/settings", icon: Settings },
    { name: "Profil", href: "/profile", icon: User },
    { name: "Bantuan", href: "/help", icon: HelpCircle },
  ];

  return (
    <aside className={`hidden md:flex w-64 border-r border-[#27272A] flex-col h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 ${theme === 'glass' ? 'bg-[#18181B]/60 backdrop-blur-xl' : 'bg-[#18181B]'
      }`}>
      {/* Brand Header */}
      <div className="p-6 border-b border-[#27272A] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center neon-glow-primary">
          <WalletCards className="w-5 h-5 text-[#FAFAFA]" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-[#FAFAFA] tracking-tight">FinanceAI</h1>
          <span className="text-[10px] text-emerald-500 font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest">
            MASIH BETA YA!
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                  ? item.highlight
                    ? "bg-indigo-600/20 text-[#FAFAFA] border border-indigo-500/30 neon-glow-primary"
                    : "bg-[#27272A] text-[#FAFAFA] border border-transparent"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1f1f23] border border-transparent"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive
                    ? item.highlight ? "text-indigo-400" : "text-[#FAFAFA]"
                    : "text-[#A1A1AA] group-hover:text-[#FAFAFA]"
                  }`} />
                <span>{item.name}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer Card */}
      <div className={`p-4 border-t border-[#27272A] flex flex-col gap-3 transition-all duration-300 ${theme === 'glass' ? 'bg-[#121214]/40' : 'bg-[#121214]'
        }`}>
        <div className="flex items-center gap-3">
          <img
            src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
            alt="Profile Avatar"
            className="w-10 h-10 rounded-full object-cover border border-[#27272A] bg-zinc-800"
          />
          <div className="flex-1 min-w-0">
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
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
