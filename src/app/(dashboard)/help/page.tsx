'use client';

import React, { useState } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  MessageSquare, 
  Receipt, 
  Users, 
  TrendingUp,
  Plus,
  Minus
} from "lucide-react";

export default function HelpPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const guides = [
    {
      icon: MessageSquare,
      title: "Chat Bahasa Alami",
      desc: "Berbicaralah secara alami untuk mencatat keuangan. Contoh: 'Beli kopi Rp25.000', 'Terima bonus freelance Rp2.000.000', atau 'Token PLN Rp350.000'. AI akan mengidentifikasi jenis transaksi dan nama merchant secara instan."
    },
    {
      icon: Receipt,
      title: "Pemindaian Struk/Nota",
      desc: "Memotret atau mengunggah gambar struk secara otomatis akan memicu analisis OCR. AI akan membaca total belanja, rincian barang, tanggal, dan menampilkannya pada kartu konfirmasi."
    },
    {
      icon: Users,
      title: "Patungan Tagihan (Split Bill)",
      desc: "Unggah struk grup atau tulis 'Bagi Rp450.000 dengan David dan Jessica'. Konfirmasikan siapa yang membayar terlebih dahulu, sesuaikan bagian masing-masing teman, dan simpan piutang ke database."
    },
    {
      icon: TrendingUp,
      title: "Batas Anggaran & Alarm",
      desc: "Tentukan batas pengeluaran di tab Anggaran. Ketika pengeluaran melebihi batas kategori yang dikonfigurasi, alarm sistem akan muncul pada ikon notifikasi Anda."
    }
  ];

  const faqs = [
    {
      q: "Bagaimana cara kerja alur konfirmasi manual?",
      a: "AI kami membantu memetakan parameter data dari bahasa alami atau OCR. Namun, AI tidak akan pernah menyimpan data ke akun Anda secara otomatis. Anda memiliki kontrol penuh untuk mengedit tanggal, kategori, merchant, atau membatalkannya sebelum mengklik 'Simpan'."
    },
    {
      q: "Kategori apa saja yang dapat dikenali secara otomatis oleh AI?",
      a: "Sistem mendukung kategori keuangan pribadi standar: Bahan Makanan, Makanan & Minuman, Tagihan & Utilitas, Langganan, Gaji & Pendapatan, Investasi, Tabungan, Transportasi, dan Hiburan."
    },
    {
      q: "Apakah saya bisa menggunakan mata uang asing?",
      a: "Ya. Secara default, FinanceAI memproses transaksi dalam Rupiah (IDR). Anda dapat mengubah mata uang utama di panel Pengaturan ke USD, EUR, atau SGD."
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div>
          <h2 className="text-sm font-bold text-[#FAFAFA] tracking-wide uppercase">Dokumentasi & Dukungan</h2>
          <p className="text-[10px] text-[#A1A1AA]">Pelajari cara terbaik untuk memanfaatkan pencatatan berbasis percakapan</p>
        </div>
      </div>

      {/* Grid of guide categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="glass-panel border border-[#27272A] rounded-2xl p-5 shadow flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold text-white leading-tight">{g.title}</h3>
              <p className="text-[10px] text-[#A1A1AA] leading-relaxed">{g.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Accordion FAQ section */}
      <div className="glass-panel border border-[#27272A] rounded-2xl p-6 shadow">
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <HelpCircle className="w-4.5 h-4.5" />
          Pertanyaan yang Sering Diajukan (FAQ)
        </h3>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-[#27272A]/50 pb-4 last:border-b-0 last:pb-0">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left py-2 font-semibold text-xs text-[#FAFAFA] hover:text-indigo-400 transition-colors"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <Minus className="w-3.5 h-3.5 text-indigo-400" /> : <Plus className="w-3.5 h-3.5 text-[#A1A1AA]" />}
              </button>
              {activeFaq === idx && (
                <p className="text-[10px] text-[#A1A1AA] leading-relaxed mt-2 pl-1 animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
