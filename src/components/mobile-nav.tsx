"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Receipt,
  Wallet,
  Settings
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat AI", href: "/chat", icon: Sparkles, highlight: true },
    { name: "Transaksi", href: "/transactions", icon: Receipt },
    { name: "Anggaran", href: "/budgets", icon: Wallet },
    { name: "Pengaturan", href: "/settings", icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#18181B]/95 backdrop-blur-xl border-t border-[#27272A] z-40 flex items-center justify-around px-4 pb-safe shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
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
    </div>
  );
}
