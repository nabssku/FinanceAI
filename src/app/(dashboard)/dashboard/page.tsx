import React from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus
} from "lucide-react";
import { getDashboardStats, getAIInsights } from "@/app/actions/transaction-actions";
import { CashFlowChart } from "@/components/dashboard-charts";

export const revalidate = 0; // Disable caching to ensure statistics reflect new logs instantly

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const insights = await getAIInsights();

  // Helper for positive/negative signs
  const formatVal = (val: number) => `Rp${val.toLocaleString('id-ID')}`;

  const metrics = [
    {
      name: "Saldo Saat Ini",
      value: stats.currentBalance,
      icon: Wallet,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      desc: "Saldo tunai tersedia"
    },
    {
      name: "Pendapatan Bulanan",
      value: stats.monthlyIncome,
      icon: ArrowUpRight,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      desc: "Total pendapatan bulan ini"
    },
    {
      name: "Pengeluaran Bulanan",
      value: stats.monthlyExpense,
      icon: ArrowDownRight,
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      desc: "Total uang keluar"
    },
    {
      name: "Tabungan & Investasi",
      value: stats.totalSavings,
      icon: TrendingUp,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      desc: "Aset & cadangan kekayaan"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome AI banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/65 to-zinc-900 border border-indigo-500/20 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative">
          <h2 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse-glow" />
            Ringkasan Analisis Keuangan
          </h2>
          <p className="text-[10px] text-[#A1A1AA] max-w-xl">
            Asisten kami menerjemahkan obrolan menjadi catatan keuangan otomatis. Buka chat di bawah atau ambil foto struk transaksi Anda.
          </p>
        </div>
        <Link 
          href="/chat"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition-all flex items-center gap-1.5 shrink-0 neon-glow-primary self-end md:self-auto"
        >
          <span>Buka Chat AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* METRIC STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.name}
              className="glass-panel border border-[#27272A] rounded-xl p-5 shadow flex flex-col justify-between min-h-[110px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#A1A1AA] tracking-wide uppercase">{item.name}</span>
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-extrabold text-[#FAFAFA] truncate">
                  {formatVal(item.value)}
                </p>
                <span className="text-[9px] text-[#A1A1AA] mt-0.5 block leading-none">{item.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI INSIGHTS & CASH FLOW CHART GRID */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Cash Flow Spline Area */}
        <div className="md:col-span-8 glass-panel border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#FAFAFA]">Perbandingan Arus Kas</h3>
              <p className="text-[9px] text-[#A1A1AA]">Visualisasi Pendapatan vs Pengeluaran 6 bulan terakhir</p>
            </div>
          </div>
          <CashFlowChart data={stats.cashFlow} />
        </div>

        {/* AI Insights Panel */}
        <div className="md:col-span-4 glass-panel border border-[#27272A] rounded-2xl p-5 flex flex-col justify-between shadow relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#27272A]/50 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-[#FAFAFA]">Analisis AI</h3>
            </div>
            
            <div className="space-y-3">
              {insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <p className="text-[10px] text-[#A1A1AA] leading-normal">{insight}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Link 
            href="/chat"
            className="mt-6 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit"
          >
            <span>Tanya asisten AI untuk analisis detail</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* BUDGETS, RECENT TRANSACTIONS & UPCOMING BILLS ROW */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Recent Transactions List */}
        <div className="md:col-span-6 glass-panel border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4 shadow">
          <div className="flex items-center justify-between border-b border-[#27272A]/50 pb-2">
            <h3 className="text-xs font-bold text-[#FAFAFA]">Transaksi Terbaru</h3>
            <Link 
              href="/transactions"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
            >
              Lihat semua
            </Link>
          </div>

          <div className="divide-y divide-[#27272A]/40 space-y-3.5">
            {stats.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-[10px] text-[#A1A1AA]">
                Belum ada transaksi. Catat transaksi baru melalui halaman Chat AI!
              </div>
            ) : (
              stats.recentTransactions.map((tx: any) => {
                const isIncome = tx.type === "INCOME";
                
                return (
                  <div key={tx.id} className="flex items-center justify-between pt-3.5 first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold ${
                        isIncome 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-[#27272A] text-[#FAFAFA] border-[#27272A]"
                      }`}>
                        {tx.category.substring(0, 2)}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-semibold text-[#FAFAFA] leading-none">{tx.merchant}</h4>
                        <span className="text-[9px] text-[#A1A1AA] mt-1 block">
                          {tx.category} • {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${isIncome ? 'text-emerald-400' : 'text-[#FAFAFA]'}`}>
                        {isIncome ? "+" : "-"} Rp{tx.amount.toLocaleString('id-ID')}
                      </p>
                      {tx.tags.length > 0 && (
                        <span className="text-[8px] text-[#A1A1AA] bg-zinc-800 px-1 py-0.5 rounded ml-1">
                          {tx.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Budget Progress & Upcoming Bills */}
        <div className="md:col-span-6 flex flex-col gap-6">
          {/* Budgets Tracker Card */}
          <div className="glass-panel border border-[#27272A] rounded-2xl p-5 shadow flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272A]/50 pb-2">
              <h3 className="text-xs font-bold text-[#FAFAFA]">Kemajuan Target Anggaran</h3>
              <Link 
                href="/budgets"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-4">
              {stats.budgetLimit === 0 ? (
                <div className="text-center py-6 text-[10px] text-[#A1A1AA]">
                  Belum ada batas anggaran yang diatur untuk bulan ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Aggregated budget meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#A1A1AA] font-medium">Total Anggaran Bulanan</span>
                      <span className="font-bold text-[#FAFAFA]">
                        Rp{stats.budgetSpent.toLocaleString('id-ID')} / Rp{stats.budgetLimit.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full bg-[#27272A] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          stats.budgetSpent > stats.budgetLimit ? 'bg-red-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min((stats.budgetSpent / stats.budgetLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Bills Card */}
          <div className="glass-panel border border-[#27272A] rounded-2xl p-5 shadow flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272A]/50 pb-2">
              <h3 className="text-xs font-bold text-[#FAFAFA]">Pengingat Mendatang</h3>
              <span className="text-[9px] text-[#A1A1AA] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Bulan ini
              </span>
            </div>

            <div className="space-y-3">
              {stats.upcomingBills.length === 0 ? (
                <div className="text-center py-4 text-[10px] text-[#A1A1AA]">
                  Tidak ada tagihan atau langganan mendatang.
                </div>
              ) : (
                stats.upcomingBills.map((bill: any) => (
                  <div key={bill.id} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-zinc-950/40 border border-[#27272A]/50">
                    <div className="text-left">
                      <h4 className="font-semibold text-white leading-none">{bill.merchant}</h4>
                      <span className="text-[9px] text-[#A1A1AA] mt-1 block">Jatuh Tempo: {bill.dueDate} • {bill.category}</span>
                    </div>
                    <span className="font-bold text-red-400">Rp{bill.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
