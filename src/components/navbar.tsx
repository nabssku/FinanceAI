'use client';

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, X, CheckSquare, Sparkles } from "lucide-react";
import { getNotifications, markNotificationsAsRead } from "@/app/actions/settings-actions";

export function Navbar({ theme }: { theme?: string }) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get current section name
  const getHeaderTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/chat")) return "Asisten Chat AI";
    if (pathname.startsWith("/transactions")) return "Manajer Transaksi";
    if (pathname.startsWith("/analytics")) return "Analisis Keuangan";
    if (pathname.startsWith("/budgets")) return "Anggaran & Batas";
    if (pathname.startsWith("/settings")) return "Pengaturan";
    if (pathname.startsWith("/profile")) return "Profil Pengguna";
    if (pathname.startsWith("/help")) return "Bantuan & Dokumentasi";
    return "FinanceAI";
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds for dynamic alarms
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await markNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className={`h-16 border-b border-[#27272A] px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 transition-all duration-300 ${
      theme === 'glass' ? 'bg-[#18181B]/60 backdrop-blur-xl' : 'bg-[#18181B]'
    }`}>
      {/* Title / Path indicator */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-[#FAFAFA] tracking-tight md:text-base">
          {getHeaderTitle()}
        </h2>
        {pathname.startsWith("/chat") && (
          <span className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse-glow">
            <Sparkles className="w-2.5 h-2.5" />
            AI Aktif
          </span>
        )}
      </div>

      {/* Action utilities */}
      <div className="flex items-center gap-4">
        {/* Global search launcher (UI only) */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi... (Cmd+K)"
            disabled
            className="w-64 pl-9 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] placeholder-[#A1A1AA] outline-none"
          />
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-all relative border border-transparent hover:border-[#27272A]"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#18181B] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up">
              <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
                <span className="text-xs font-bold text-[#FAFAFA]">Notifikasi</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAsRead}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[#27272A]/55">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#A1A1AA]">
                    Belum ada notifikasi.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 transition-colors ${notif.read ? 'bg-transparent' : 'bg-indigo-500/5'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-[#FAFAFA] leading-tight">
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-[#A1A1AA] shrink-0">
                          {new Date(notif.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#A1A1AA] mt-1 leading-normal">
                        {notif.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-[#27272A] bg-[#0c0c0d] text-center">
                <span className="text-[9px] text-[#A1A1AA]">Menampilkan alarm terbaru</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
