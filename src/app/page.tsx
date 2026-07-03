"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  WalletCards, 
  Sparkles, 
  Receipt, 
  Split, 
  TrendingUp, 
  BellRing, 
  ShieldAlert, 
  Plus, 
  Minus,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [chatStep, setChatStep] = useState(0);
  
  const chatScenarios = [
    { role: "user", text: "Saya membeli kopi seharga Rp35.000 di Starbucks" },
    { role: "assistant", card: { merchant: "Starbucks", amount: 35000, category: "Makanan", type: "EXPENSE" } },
    { role: "user", text: "Bagi tagihan makan malam Rp450.000 dengan Sarah dan Nabil" },
    { role: "assistant", card: { merchant: "Restoran", amount: 450000, category: "Makanan", type: "SPLIT_BILL", split: "Dibagi 3 (Sarah, Nabil, Anda)" } }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setChatStep(prev => (prev + 1) % (chatScenarios.length + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: Sparkles,
      title: "Pencatatan Berbasis Obrolan",
      desc: "Ketik secara alami seperti sedang mengobrol biasa. Beri tahu pemasukan, pengeluaran, atau transfer tanpa perlu mengisi formulir manual."
    },
    {
      icon: Receipt,
      title: "Pemindaian Struk Instan (OCR)",
      desc: "Unggah atau foto struk belanjaan Anda. AI kami langsung mengekstrak nama toko, nominal, tanggal, dan menyarankan kategori otomatis."
    },
    {
      icon: Split,
      title: "Pembagian Tagihan Dinamis (Split Bill)",
      desc: "Hitung porsi pembayaran masing-masing rekan patungan Anda secara instan dan buat tautan pembayaran publik untuk ditagih ke teman."
    },
    {
      icon: TrendingUp,
      title: "Visualisasi Analisis Interaktif",
      desc: "Pantau diagram kemajuan pengeluaran bulanan, riwayat mingguan, hingga anggaran yang terpakai dengan grafik modern."
    },
    {
      icon: BellRing,
      title: "Pengingat Batas Anggaran",
      desc: "Atur batas maksimal pengeluaran bulanan untuk kategori tertentu dan terima alarm peringatan sebelum anggaran Anda terlewati."
    },
    {
      icon: ShieldAlert,
      title: "Proteksi Konfirmasi Pengguna",
      desc: "AI hanya membantu membaca struk dan menyiapkan draf. Tidak ada satu rupiah pun yang disimpan ke database sebelum Anda menyetujuinya."
    }
  ];

  const faqs = [
    {
      q: "Apakah FinanceAI terhubung langsung ke rekening bank saya?",
      a: "Tidak. FinanceAI sangat menghargai privasi Anda dan menolak sinkronisasi otomatis ke rekening bank yang seringkali terasa invasif. Anda mencatat secara mandiri melalui obrolan AI atau foto struk dan memegang kendali penuh atas konfirmasi data."
    },
    {
      q: "Bagaimana dengan keamanan foto struk yang saya unggah?",
      a: "Foto struk Anda diunggah dengan aman menggunakan protokol enkripsi HTTPS melalui Cloudinary dan Vercel. Kami tidak pernah membagikan data atau foto Anda kepada pihak ketiga."
    },
    {
      q: "Apakah saya bisa menyesuaikan kategori dan anggaran bulanan?",
      a: "Tentu saja! FinanceAI dilengkapi dengan kategori finansial bawaan dan membebaskan Anda menyetel batas maksimal pengeluaran bulanan untuk masing-masing kategori guna memantau arus kas harian Anda."
    },
    {
      q: "Model AI apa yang digunakan untuk memproses data chat dan struk?",
      a: "FinanceAI menggunakan API Groq berkinerja tinggi yang didukung oleh model Llama untuk menganalisis teks obrolan secara instan, serta Llama Vision untuk memindai dan mengenali teks pada foto struk belanjaan Anda."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* HEADER NAVBAR */}
      <header className="border-b border-[#27272A] bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center neon-glow-primary">
              <WalletCards className="w-5 h-5 text-[#FAFAFA]" />
            </div>
            <span className="font-bold text-lg text-[#FAFAFA] tracking-tight">FinanceAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#A1A1AA]">
            <a href="#features" className="hover:text-[#FAFAFA] transition-colors">Fitur Utama</a>
            <a href="#preview" className="hover:text-[#FAFAFA] transition-colors">Demo Chat AI</a>
            <a href="#pricing" className="hover:text-[#FAFAFA] transition-colors">Gratis Selamanya</a>
            <a href="#faq" className="hover:text-[#FAFAFA] transition-colors">Tanya Jawab</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-all neon-glow-primary"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-[#27272A]">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cara Baru Mencatat Keuangan Pribadi</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Bicara dengan uang Anda.<br />
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
                AI mencatat, Anda konfirmasi.
              </span>
            </h1>
            <p className="text-base md:text-lg text-[#A1A1AA] max-w-xl leading-relaxed">
              Tinggalkan formulir pencatatan yang rumit. Catat pemasukan, pengeluaran, dan bagi struk belanja bersama teman (split bill) hanya dengan berkirim pesan alami ke asisten AI atau unggah foto struk belanja Anda.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link 
                href="/login" 
                className="px-6 py-3.5 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition-all neon-glow-primary flex items-center gap-2 group cursor-pointer"
              >
                <span>Mulai Gratis Selamanya</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a 
                href="#preview" 
                className="px-6 py-3.5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#202024] text-sm font-bold text-[#FAFAFA] transition-all"
              >
                Lihat Demo Obrolan
              </a>
            </div>
          </div>

          {/* AI INTERACTIVE CARD PREVIEW */}
          <div id="preview" className="md:col-span-5 w-full">
            <div className="glass-panel border border-[#27272A] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 min-h-[380px] justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl" />
              
              {/* Chat log header */}
              <div className="flex items-center justify-between border-b border-[#27272A]/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-[#FAFAFA]">Demo Interaksi Asisten AI</span>
                </div>
                <span className="text-[10px] text-[#A1A1AA]">Demo berjalan otomatis</span>
              </div>

              {/* Chat Body */}
              <div className="flex-1 flex flex-col gap-4 mt-2">
                {/* User Message */}
                <div className={`p-3 rounded-xl bg-[#27272A]/60 border border-[#27272A] self-end max-w-[85%] text-xs text-[#FAFAFA] transition-all duration-300 transform ${chatStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  {chatStep >= 1 && chatScenarios[Math.min(chatStep - 1, 1) * 2]?.text}
                </div>

                {/* Assistant Extraction Card */}
                {chatStep >= 2 && (
                  <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] self-start max-w-[95%] w-full flex flex-col gap-3 text-xs shadow-lg animate-slide-up">
                    <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                      <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Hasil Ekstraksi Transaksi
                      </span>
                      <span className="text-[9px] text-[#A1A1AA] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                        {chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A1A1AA]">
                      <div>
                        <span>Merchant:</span>
                        <p className="font-semibold text-[#FAFAFA]">{chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.merchant}</p>
                      </div>
                      <div>
                        <span>Total:</span>
                        <p className="font-semibold text-emerald-400">Rp{chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.amount?.toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <span>Kategori:</span>
                        <p className="font-semibold text-[#FAFAFA]">{chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.category}</p>
                      </div>
                      {chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.split && (
                        <div>
                          <span>Patungan:</span>
                          <p className="font-semibold text-indigo-300">{chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.split}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2 pt-2 border-t border-[#27272A]/50">
                      <button className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-700 transition-colors">
                        Simpan
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-[#27272A] text-[#FAFAFA] font-semibold text-[10px] hover:bg-zinc-800">
                        Ubah
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-[#18181B] text-[#A1A1AA] text-[10px] hover:text-red-400">
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {chatStep === 0 && (
                  <div className="flex-1 flex items-center justify-center text-center text-xs text-[#A1A1AA]">
                    Simulasi interaksi pencatatan asisten...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 scroll-mt-10">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Tampilan Bersih. Logika Presisi. Keamanan Utama.
          </h2>
          <p className="text-[#A1A1AA] text-sm md:text-base">
            Tanpa perlu sinkronisasi kredensial bank yang berisiko. Kendalikan penuh catatan finansial Anda secara mandiri.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass-panel glass-panel-hover rounded-xl p-6 border border-[#27272A] flex flex-col gap-4 transition-all">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-[#FAFAFA]">{feat.title}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 100% FREE VALUE SECTION (REPLACED PRICING PACKAGES) */}
      <section id="pricing" className="py-24 border-t border-b border-[#27272A] bg-[#121214]/40 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-indigo-600/5 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-4">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 w-fit mx-auto uppercase tracking-widest">
              Aplikasi 100% Gratis
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Semua Fitur Bebas Digunakan Tanpa Batas</h2>
            <p className="text-[#A1A1AA] text-sm md:text-base">
              Tidak ada paket berbayar, tidak ada langganan bulanan, dan tidak ada batasan kuota fitur.
            </p>
          </div>

          <div className="max-w-3xl mx-auto glass-panel border border-[#27272A] rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Bebas Akses Kapan Saja</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  FinanceAI didesain sebagai platform pencatatan keuangan mandiri yang sepenuhnya terbuka dan gratis untuk membantu pengelolaan keuangan harian Anda tanpa kecemasan biaya tambahan.
                </p>
                <div className="pt-2">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    <span>Mulai Catat Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              
              <div className="space-y-3.5 border-t md:border-t-0 md:border-l border-[#27272A] pt-6 md:pt-0 md:pl-8">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Keunggulan Gratis Kami:</h4>
                <ul className="space-y-2.5 text-xs text-[#FAFAFA]">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Pemindaian OCR struk tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Akses asisten chat pintar sepuasnya</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Bagi tagihan (split bill) sepuasnya</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Dashboard grafik analisis lengkap</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6 w-full scroll-mt-10">
        <h2 className="text-3xl font-bold text-center mb-12">Pertanyaan yang Sering Diajukan</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-[#27272A] pb-4">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left py-3 font-semibold text-sm hover:text-[#FAFAFA] transition-colors"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <Minus className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4" />}
              </button>
              {activeFaq === idx && (
                <p className="text-xs text-[#A1A1AA] leading-relaxed mt-2 pl-1 animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#27272A] bg-[#0c0c0d] py-12 text-center text-xs text-[#A1A1AA]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <WalletCards className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-[#FAFAFA]">FinanceAI © 2026</span>
          </div>
          <p className="text-[10px] text-[#A1A1AA] max-w-md leading-normal">
            Diberdayakan oleh Next.js, Prisma, Neon Serverless Postgres, dan Groq AI. Dibuat dengan presisi dan perhatian tingkat tinggi.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#FAFAFA] transition-colors">Privasi</a>
            <a href="#" className="hover:text-[#FAFAFA] transition-colors">Ketentuan</a>
            <a href="#" className="hover:text-[#FAFAFA] transition-colors">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
