'use client';

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
  ChevronRight, 
  ArrowRight,
  Plus,
  Minus
} from "lucide-react";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Simulated Chat animation state
  const [chatStep, setChatStep] = useState(0);
  
  const chatScenarios = [
    { role: "user", text: "I bought coffee for Rp35.000 at Starbucks" },
    { role: "assistant", card: { merchant: "Starbucks", amount: 35000, category: "Food", type: "EXPENSE" } },
    { role: "user", text: "Split restaurant bill Rp450.000 with Sarah and David" },
    { role: "assistant", card: { merchant: "Restaurant", amount: 450000, category: "Food", type: "SPLIT_BILL", split: "3 ways (Sarah, David, You)" } }
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
      title: "Conversational Logs",
      desc: "Speak naturally to your money. Tell it what you earned, spent, or moved. No manual fields, ever."
    },
    {
      icon: Receipt,
      title: "Instant OCR Scan",
      desc: "Drag or snap receipt photos. Our AI maps totals, items, dates, and categories immediately."
    },
    {
      icon: Split,
      title: "Dynamic Split Bills",
      desc: "Unequal shares, custom friend lists, and automatically calculated receivables with one confirmation."
    },
    {
      icon: TrendingUp,
      title: "Spline Analytics",
      desc: "Vibrant custom chart dashboards displaying budgets, weekly trends, and top spending brackets."
    },
    {
      icon: BellRing,
      title: "Budget Alarms",
      desc: "Set category metrics. Receive subtle system-wide reminders before limits are breached."
    },
    {
      icon: ShieldAlert,
      title: "Zero-Auto-Save Protection",
      desc: "The AI extracts and pre-populates everything, but never saves a single rupiah until you click 'Save'."
    }
  ];

  const faqs = [
    {
      q: "Does FinanceAI connect directly to my bank accounts?",
      a: "No. FinanceAI prioritizes user privacy and manual confirmation. Instead of automated syncing which can feel invasive, you input transactions naturally in conversation or via photo, confirming each entry."
    },
    {
      q: "How secure is my receipt photo upload?",
      a: "Your receipt photos are processed securely using encrypted connections and hosted on Vercel/Cloudinary storage. Your personal information is never shared or used to train public LLM weights."
    },
    {
      q: "Can I customize spending categories and budgets?",
      a: "Yes! FinanceAI comes with pre-defined categories and allows you to set custom monthly budgets. The AI learns your custom categories and automatically suggests them for future logs."
    },
    {
      q: "What AI models process the text inputs and receipts?",
      a: "FinanceAI utilizes high-throughput Groq APIs running Llama 3.3 for lightning-fast natural language parsing, and Llama 3.2 Vision for receipt OCR analysis."
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
            <a href="#features" className="hover:text-[#FAFAFA] transition-colors">Features</a>
            <a href="#preview" className="hover:text-[#FAFAFA] transition-colors">AI Preview</a>
            <a href="#pricing" className="hover:text-[#FAFAFA] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#FAFAFA] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-all neon-glow-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-[#27272A]">
        {/* Background blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Finance Reimagined</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Talk to your money.<br />
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
                AI extracts, you confirm.
              </span>
            </h1>
            <p className="text-base md:text-lg text-[#A1A1AA] max-w-xl leading-relaxed">
              Ditch complicated forms. Record income, expenses, and split restaurant receipts by texting our AI assistant or snapping a photo. Take complete command with zero auto-save anxiety.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link 
                href="/login" 
                className="px-6 py-3.5 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition-all neon-glow-primary flex items-center gap-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a 
                href="#preview" 
                className="px-6 py-3.5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#202024] text-sm font-bold text-[#FAFAFA] transition-all"
              >
                See Live Mock Chat
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
                  <span className="text-xs font-semibold text-[#FAFAFA]">Assistant Sandbox</span>
                </div>
                <span className="text-[10px] text-[#A1A1AA]">Press Demo to test inside</span>
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
                        AI Extracted Transaction
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
                        <span>Amount:</span>
                        <p className="font-semibold text-emerald-400">Rp{chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.amount?.toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <span>Category:</span>
                        <p className="font-semibold text-[#FAFAFA]">{chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.category}</p>
                      </div>
                      {chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.split && (
                        <div>
                          <span>Split:</span>
                          <p className="font-semibold text-indigo-300">{chatScenarios[Math.min(chatStep - 1, 1) * 2 + 1]?.card?.split}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2 pt-2 border-t border-[#27272A]/50">
                      <button className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-700 transition-colors">
                        Save
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-[#27272A] text-[#FAFAFA] font-semibold text-[10px] hover:bg-zinc-800">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-[#18181B] text-[#A1A1AA] text-[10px] hover:text-red-400">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {chatStep === 0 && (
                  <div className="flex-1 flex items-center justify-center text-center text-xs text-[#A1A1AA]">
                    Simulating typical conversational interaction...
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
            Clean interface. Linear feel. Deep logic.
          </h2>
          <p className="text-[#A1A1AA] text-sm md:text-base">
            No messy configurations or banking credentials required. Retain complete control with streamlined startup styling.
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

      {/* PRICING PLANS */}
      <section id="pricing" className="py-24 border-t border-b border-[#27272A] bg-[#121214]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Flexible pricing for creators</h2>
            <p className="text-[#A1A1AA] text-sm">Start tracking free, or scale to premium with multi-receipt automation and deep charts.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="glass-panel rounded-xl p-8 border border-[#27272A] flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Free Sandbox</span>
                <h3 className="text-3xl font-bold">Rp0</h3>
                <p className="text-xs text-[#A1A1AA]">Perfect for individual monthly budget logging and natural language tracking.</p>
                <div className="h-px bg-[#27272A] my-2" />
                <ul className="space-y-2 text-xs text-[#FAFAFA] flex flex-col gap-1">
                  <li className="flex items-center gap-2">✓ Natural language chat assistant</li>
                  <li className="flex items-center gap-2">✓ Manual confirmation workflow</li>
                  <li className="flex items-center gap-2">✓ Standard dashboard & budget meters</li>
                  <li className="flex items-center gap-2">✓ 15 Receipt uploads per month</li>
                </ul>
              </div>
              <Link 
                href="/login" 
                className="w-full py-3 rounded-lg bg-[#27272A] text-center font-bold text-xs text-[#FAFAFA] hover:bg-zinc-800 transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="glass-panel rounded-xl p-8 border-2 border-indigo-600 flex flex-col justify-between gap-8 relative overflow-hidden shadow-indigo-950/20 shadow-2xl">
              <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-[10px] font-bold text-white rounded-bl-lg uppercase tracking-wide">
                RECOMMENDED
              </div>
              
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Pro Edition</span>
                <h3 className="text-3xl font-bold">
                  Rp149.000 <span className="text-xs text-[#A1A1AA] font-normal">/ month</span>
                </h3>
                <p className="text-xs text-[#A1A1AA]">Unlock infinite visual analytics, split receipt exports, and advanced AI categories.</p>
                <div className="h-px bg-[#27272A] my-2" />
                <ul className="space-y-2 text-xs text-[#FAFAFA] flex flex-col gap-1">
                  <li className="flex items-center gap-2 text-indigo-400">✓ Everything in Free</li>
                  <li className="flex items-center gap-2">✓ Unlimited receipt uploads & OCR scans</li>
                  <li className="flex items-center gap-2">✓ Rich weekly & monthly spline analytics</li>
                  <li className="flex items-center gap-2">✓ Advanced split bills (unequal, unlimited friends)</li>
                  <li className="flex items-center gap-2">✓ Custom category creation & API exports</li>
                </ul>
              </div>
              <Link 
                href="/login" 
                className="w-full py-3 rounded-lg bg-indigo-600 text-center font-bold text-xs text-white hover:bg-indigo-700 transition-colors neon-glow-primary"
              >
                Get Pro Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6 w-full scroll-mt-10">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
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
          <p className="text-[10px] text-zinc-600">
            Powered by Next.js 15, Prisma 7, Neon Serverless Postgres, and Groq APIs. Made with venture-grade attention.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#FAFAFA] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#FAFAFA] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#FAFAFA] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
