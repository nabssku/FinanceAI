'use client';

import React, { useState, useEffect, useTransition } from "react";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Moon, 
  Save, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { getSettings, updateSettings } from "@/app/actions/settings-actions";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = (key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFieldChange = (key: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    startTransition(async () => {
      try {
        await updateSettings(settings);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        await loadData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (!settings) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#A1A1AA]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div>
          <h2 className="text-sm font-bold text-[#FAFAFA] tracking-wide uppercase">Preferensi & Opsi</h2>
          <p className="text-[10px] text-[#A1A1AA]">Kelola variabel regional dan alarm aplikasi</p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span>Pengaturan sistem berhasil diperbarui</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Localization settings Card */}
        <div className="glass-panel border border-[#27272A] rounded-2xl p-6 flex flex-col gap-6 shadow">
          <div className="flex items-center gap-2 border-b border-[#27272A]/50 pb-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white">Lokalisasi & Mata Uang</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#A1A1AA] uppercase font-bold">Mata Uang Utama</label>
              <select
                value={settings.currency}
                onChange={(e) => handleFieldChange("currency", e.target.value)}
                className="input-premium py-2 px-3 text-xs w-full"
              >
                <option value="IDR">IDR (Rp) - Rupiah Indonesia</option>
                <option value="USD">USD ($) - Dolar AS</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="SGD">SGD (S$) - Dolar Singapura</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#A1A1AA] uppercase font-bold">Tema Pilihan</label>
              <select
                value={settings.theme}
                onChange={(e) => handleFieldChange("theme", e.target.value)}
                className="input-premium py-2 px-3 text-xs w-full"
              >
                <option value="dark">Tema Gelap (Standar)</option>
                <option value="glass">Glassmorphic Terang</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications and Alerts Card */}
        <div className="glass-panel border border-[#27272A] rounded-2xl p-6 flex flex-col gap-5 shadow">
          <div className="flex items-center gap-2 border-b border-[#27272A]/50 pb-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white">Konfigurasi Alarm Sistem</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Alert items */}
            <div className="flex items-center justify-between py-2 border-b border-[#27272A]/30">
              <div>
                <h4 className="font-semibold text-[#FAFAFA]">Batas Anggaran Terlampaui</h4>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Picu notifikasi saat catatan pengeluaran melebihi target bulanan</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("budgetAlerts")}
                className={`w-10 h-6 rounded-full transition-all relative ${settings.budgetAlerts ? 'bg-indigo-600' : 'bg-[#27272A]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.budgetAlerts ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#27272A]/30">
              <div>
                <h4 className="font-semibold text-[#FAFAFA]">Pengingat Tagihan & Langganan</h4>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Terima pengingat untuk template tagihan dan pengeluaran berulang</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("billReminders")}
                className={`w-10 h-6 rounded-full transition-all relative ${settings.billReminders ? 'bg-indigo-600' : 'bg-[#27272A]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.billReminders ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="font-semibold text-[#FAFAFA]">Laporan Ringkasan Mingguan</h4>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Biarkan AI menyusun tren arus kas mingguan dan analisis performa</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("weeklySummary")}
                className={`w-10 h-6 rounded-full transition-all relative ${settings.weeklySummary ? 'bg-indigo-600' : 'bg-[#27272A]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.weeklySummary ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 neon-glow-primary disabled:opacity-55 cursor-pointer"
        >
          {isPending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Simpan Preferensi</span>
        </button>
      </form>

    </div>
  );
}
