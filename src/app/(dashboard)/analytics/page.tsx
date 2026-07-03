import React from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Activity,
  Award,
  CircleDollarSign,
  Calendar
} from "lucide-react";
import { getTransactions } from "@/app/actions/transaction-actions";
import { 
  SpendingTrendChart, 
  CategoryPieChart, 
  CashFlowChart 
} from "@/components/dashboard-charts";

export const revalidate = 0; // Fresh updates on navigation

export default async function AnalyticsPage() {
  const transactions: any[] = await getTransactions();

  // 1. Core Summary Math
  let totalIncome = 0;
  let totalExpense = 0;
  let savingsReserves = 0;
  let maxTransaction = 0;
  let maxMerchant = "None";

  const expensesOnly = transactions.filter(tx => 
    ["EXPENSE", "BILL", "SUBSCRIPTION", "SPLIT_BILL"].includes(tx.type)
  );

  transactions.forEach(tx => {
    if (tx.type === "INCOME") {
      totalIncome += tx.amount;
    } else if (["EXPENSE", "BILL", "SUBSCRIPTION", "SPLIT_BILL"].includes(tx.type)) {
      totalExpense += tx.amount;
      if (tx.amount > maxTransaction) {
        maxTransaction = tx.amount;
        maxMerchant = tx.merchant;
      }
    } else if (tx.type === "SAVINGS" || tx.type === "INVESTMENT") {
      savingsReserves += tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpense - savingsReserves;

  // 2. Spending Trend (Daily breakdown for the last 30 days)
  const last30DaysMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    last30DaysMap[dateStr] = 0;
  }

  expensesOnly.forEach(tx => {
    const txDate = new Date(tx.date);
    const dateStr = txDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (last30DaysMap[dateStr] !== undefined) {
      last30DaysMap[dateStr] += tx.amount;
    }
  });

  const spendingTrend = Object.entries(last30DaysMap).map(([date, amount]) => ({
    date,
    amount
  }));

  // 3. Category Breakdown for Pie Chart
  const categoryMap: Record<string, number> = {};
  expensesOnly.forEach(tx => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
  });

  const categoryPieData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 4. Cash Flow Data (last 6 months)
  const cashFlowMap: Record<string, { income: number; expense: number }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    cashFlowMap[label] = { income: 0, expense: 0 };
  }

  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    const label = `${monthNames[txDate.getMonth()]} ${txDate.getFullYear().toString().substring(2)}`;
    if (cashFlowMap[label] !== undefined) {
      if (tx.type === "INCOME") {
        cashFlowMap[label].income += tx.amount;
      } else if (["EXPENSE", "BILL", "SUBSCRIPTION", "SPLIT_BILL"].includes(tx.type)) {
        cashFlowMap[label].expense += tx.amount;
      }
    }
  });

  const cashFlowData = Object.entries(cashFlowMap).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense
  }));

  // 5. Largest Transactions Log
  const largestTransactions = [...expensesOnly]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const stats = [
    { name: "Aggregate Inflow", value: totalIncome, icon: ArrowUpRight, color: "text-emerald-400" },
    { name: "Aggregate Outflow", value: totalExpense, icon: ArrowDownRight, color: "text-red-400" },
    { name: "Liquid Assets", value: netSavings, icon: Wallet, color: "text-indigo-400" },
    { name: "Peak Expenditure", value: maxTransaction, merchant: maxMerchant, icon: Award, color: "text-amber-400" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="glass-panel border border-[#27272A] rounded-xl p-5 shadow flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">{s.name}</span>
                <Icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <div className="mt-4 text-left">
                <h4 className="text-sm font-extrabold text-[#FAFAFA]">Rp{s.value.toLocaleString('id-ID')}</h4>
                <p className="text-[9px] text-[#A1A1AA] truncate mt-0.5">
                  {s.merchant ? `At ${s.merchant}` : "Cumulative total"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spending Trend (30 Days Spline Area) */}
      <div className="glass-panel border border-[#27272A] rounded-2xl p-5 shadow flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#FAFAFA] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              Daily Spending Trend
            </h3>
            <p className="text-[9px] text-[#A1A1AA]">30-Day moving spline of total expenses</p>
          </div>
          <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1 border border-[#27272A] bg-zinc-950 px-2 py-0.5 rounded">
            <Calendar className="w-3.5 h-3.5" />
            Last 30 Days
          </span>
        </div>
        <SpendingTrendChart data={spendingTrend} />
      </div>

      {/* Cash Flow Bars and Donut Splits */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Category Pie */}
        <div className="glass-panel border border-[#27272A] rounded-2xl p-5 shadow flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-[#FAFAFA] flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-emerald-400" />
              Expense Distribution
            </h3>
            <p className="text-[9px] text-[#A1A1AA]">Total expenses broken down by category labels</p>
          </div>
          {categoryPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#A1A1AA]">
              No expense categories tracked. Try saving some transactions first!
            </div>
          ) : (
            <CategoryPieChart data={categoryPieData} />
          )}
        </div>

        {/* 6 Month Cash Flow */}
        <div className="glass-panel border border-[#27272A] rounded-2xl p-5 shadow flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-[#FAFAFA] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Historical Cash Flow
            </h3>
            <p className="text-[9px] text-[#A1A1AA]">Inflow income vs Outflow spending trends over 6 months</p>
          </div>
          <CashFlowChart data={cashFlowData} />
        </div>
      </div>

      {/* Top Spending Categories and Largest Transactions list */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Largest Transactions */}
        <div className="md:col-span-7 glass-panel border border-[#27272A] rounded-2xl p-5 shadow flex flex-col gap-4">
          <div className="border-b border-[#27272A]/50 pb-2">
            <h3 className="text-xs font-bold text-[#FAFAFA]">Largest Expenditure Entries</h3>
            <p className="text-[9px] text-[#A1A1AA]">Detailed log of top expenses by amount</p>
          </div>

          <div className="divide-y divide-[#27272A]/40">
            {largestTransactions.length === 0 ? (
              <div className="text-center py-8 text-[10px] text-[#A1A1AA]">
                No expenses logged.
              </div>
            ) : (
              largestTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-3 first:pt-0">
                  <div className="text-left">
                    <h4 className="text-xs font-semibold text-white">{tx.merchant}</h4>
                    <span className="text-[9px] text-[#A1A1AA]">{tx.category} • {new Date(tx.date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#FAFAFA]">Rp{tx.amount.toLocaleString('id-ID')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Ranking list */}
        <div className="md:col-span-5 glass-panel border border-[#27272A] rounded-2xl p-5 shadow flex flex-col gap-4">
          <div className="border-b border-[#27272A]/50 pb-2">
            <h3 className="text-xs font-bold text-[#FAFAFA]">Top Category Rankings</h3>
            <p className="text-[9px] text-[#A1A1AA]">Highest expenditure category items</p>
          </div>

          <div className="space-y-4">
            {categoryPieData.length === 0 ? (
              <div className="text-center py-6 text-[10px] text-[#A1A1AA]">
                No budget data.
              </div>
            ) : (
              categoryPieData.slice(0, 4).map((cat, idx) => {
                const total = totalExpense || 1;
                const percentage = ((cat.value / total) * 100).toFixed(0);
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-white">{idx + 1}. {cat.name}</span>
                      <span className="text-[#A1A1AA]">Rp{cat.value.toLocaleString('id-ID')} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
