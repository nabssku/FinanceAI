'use client';

import React, { useState, useEffect, useTransition } from "react";
import { 
  Plus, 
  Trash2, 
  Wallet, 
  Target, 
  AlertTriangle,
  X,
  Save,
  Loader2
} from "lucide-react";
import { getBudgets, saveBudget, deleteBudget } from "@/app/actions/budget-actions";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const [newBudget, setNewBudget] = useState({
    category: "Groceries",
    limit: 0
  });

  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget.limit <= 0) return;

    startTransition(async () => {
      try {
        await saveBudget(newBudget.category, newBudget.limit);
        setIsOpen(false);
        setNewBudget({ category: "Groceries", limit: 0 });
        await loadData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus target anggaran ini?")) {
      startTransition(async () => {
        try {
          await deleteBudget(id);
          await loadData();
        } catch (e) {
          console.error(e);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div>
          <h2 className="text-sm font-bold text-[#FAFAFA] tracking-wide uppercase">Anggaran Kategori</h2>
          <p className="text-[10px] text-[#A1A1AA]">Tetapkan batas pengeluaran dan pantau indikator bulanan</p>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all flex items-center gap-1.5 neon-glow-primary cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Atur Anggaran</span>
        </button>
      </div>

      {/* Grid of budgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <div className="md:col-span-3 glass-panel border border-[#27272A] rounded-2xl p-12 text-center text-xs text-[#A1A1AA]">
            Belum ada batas pengeluaran untuk bulan ini. Klik Atur Anggaran untuk memulai.
          </div>
        ) : (
          budgets.map((b) => {
            const percentage = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
            const isExceeded = b.spent > b.limit;
            const remains = b.limit - b.spent;

            return (
              <div 
                key={b.id} 
                className={`glass-panel border rounded-2xl p-5 shadow flex flex-col justify-between min-h-[180px] transition-all ${
                  isExceeded ? 'border-red-500/30' : 'border-[#27272A]'
                }`}
              >
                {/* Info and delete button */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">{b.category}</span>
                      <h4 className="text-sm font-extrabold text-white mt-0.5">Batas: Rp{b.limit.toLocaleString('id-ID')}</h4>
                    </div>
                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-[#27272A] text-[#A1A1AA] hover:text-red-400 hover:border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#A1A1AA]">Terpakai: Rp{b.spent.toLocaleString('id-ID')}</span>
                      <span className={`font-bold ${isExceeded ? 'text-red-400' : 'text-[#FAFAFA]'}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#27272A] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isExceeded ? 'bg-red-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer alert message */}
                <div className="mt-4 pt-3 border-t border-[#27272A]/50 flex items-center justify-between text-[10px] text-[#A1A1AA]">
                  {isExceeded ? (
                    <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Lebih Rp{Math.abs(remains).toLocaleString('id-ID')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Target className="w-3.5 h-3.5 shrink-0" />
                      <span>Sisa Rp{remains.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <span className="text-[9px] text-[#A1A1AA]">{b.month}/{b.year}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIGURE BUDGET MODAL DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-panel border border-[#27272A] rounded-2xl p-6 shadow-2xl relative animate-slide-up">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-800 text-[#A1A1AA]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-indigo-400 mb-6 uppercase tracking-wider">Konfigurasikan Batas Anggaran</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Kategori</label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="input-premium py-2 px-3 text-xs w-full"
                >
                  <option value="Groceries">Bahan Makanan</option>
                  <option value="Food">Makanan & Minuman</option>
                  <option value="Bills">Tagihan & Utilitas</option>
                  <option value="Subscription">Langganan</option>
                  <option value="Salary">Gaji & Pendapatan</option>
                  <option value="Investment">Investasi</option>
                  <option value="Savings">Tabungan</option>
                  <option value="Transport">Transportasi</option>
                  <option value="Entertainment">Hiburan</option>
                  <option value="Other">Lainnya</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Jumlah Batas Anggaran (Rp)</label>
                <input
                  type="number"
                  placeholder="1500000"
                  value={newBudget.limit || ""}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: Number(e.target.value) })}
                  className="input-premium py-2 px-3 text-xs w-full font-semibold text-emerald-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 neon-glow-primary disabled:opacity-55"
              >
                {isPending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Simpan Batas Anggaran</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
