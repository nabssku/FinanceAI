'use client';

import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from "recharts";

// Premium color tokens matching user rules
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#3B82F6"];

// Cash Flow Chart (Income vs Expense comparison)
export function CashFlowChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-64 bg-zinc-900/20 animate-pulse rounded-xl" />;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="month" stroke="#A1A1AA" fontSize={10} tickLine={false} />
          <YAxis stroke="#A1A1AA" fontSize={10} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", borderRadius: "8px" }}
            labelStyle={{ color: "#FAFAFA", fontSize: "11px", fontWeight: "bold" }}
            itemStyle={{ fontSize: "11px" }}
          />
          <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
          <Bar dataKey="income" name="Income" fill="#22C55E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#4F46E5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Category Distribution Pie Chart
export function CategoryPieChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-64 bg-zinc-900/20 animate-pulse rounded-xl" />;

  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <div className="h-64 w-full flex flex-col md:flex-row items-center justify-center gap-6">
      <div className="h-48 w-48 relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `Rp${Number(value).toLocaleString('id-ID')}`}
              contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", borderRadius: "8px" }}
              itemStyle={{ color: "#FAFAFA", fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">Total Spent</span>
          <span className="text-xs font-extrabold text-[#FAFAFA]">Rp{total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full max-h-48 overflow-y-auto space-y-2 text-xs">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
          return (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="text-[#A1A1AA] font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-[#FAFAFA]">Rp{item.value.toLocaleString('id-ID')}</span>
                <span className="text-[9px] text-[#A1A1AA] ml-1.5 font-bold">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Spending Trend Spline Area Chart
export function SpendingTrendChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-64 bg-zinc-900/20 animate-pulse rounded-xl" />;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#A1A1AA" fontSize={10} tickLine={false} />
          <YAxis stroke="#A1A1AA" fontSize={10} tickLine={false} />
          <Tooltip 
            formatter={(value: any) => `Rp${Number(value).toLocaleString('id-ID')}`}
            contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", borderRadius: "8px" }}
            itemStyle={{ color: "#FAFAFA", fontSize: "11px" }}
          />
          <Area type="monotone" dataKey="amount" name="Spent" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
