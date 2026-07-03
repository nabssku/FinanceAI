'use client';

import React, { useState, useEffect, useTransition } from "react";
import { 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Calendar, 
  Tag, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft,
  Plus, 
  Save,
  Loader2,
  Filter
} from "lucide-react";
import { getTransactions, updateTransaction, deleteTransaction, createTransaction } from "@/app/actions/transaction-actions";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  
  // Dialog / Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  
  // Create manual transaction state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTxData, setNewTxData] = useState({
    type: "EXPENSE",
    merchant: "",
    amount: 0,
    date: new Date().toISOString().substring(0, 10),
    category: "Groceries",
    notes: "",
    tags: ""
  });

  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      const data = await getTransactions({
        search: searchQuery || undefined,
        type: filterType !== "ALL" ? filterType : undefined,
        category: filterCategory !== "ALL" ? filterCategory : undefined
      });
      setTransactions(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, filterType, filterCategory]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      startTransition(async () => {
        try {
          await deleteTransaction(id);
          await loadData();
        } catch (e) {
          console.error(e);
        }
      });
    }
  };

  const handleOpenEdit = (tx: any) => {
    setSelectedTx({
      ...tx,
      date: new Date(tx.date).toISOString().substring(0, 10),
      tags: tx.tags.join(", ")
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    startTransition(async () => {
      try {
        await updateTransaction(selectedTx.id, {
          ...selectedTx,
          tags: selectedTx.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        });
        setIsEditOpen(false);
        setSelectedTx(null);
        await loadData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxData.merchant || newTxData.amount <= 0) return;

    startTransition(async () => {
      try {
        await createTransaction({
          ...newTxData,
          date: new Date(newTxData.date),
          tags: newTxData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        });
        setIsAddOpen(false);
        setNewTxData({
          type: "EXPENSE",
          merchant: "",
          amount: 0,
          date: new Date().toISOString().substring(0, 10),
          category: "Groceries",
          notes: "",
          tags: ""
        });
        await loadData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const getTxIcon = (type: string) => {
    if (type === "INCOME") return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (type === "TRANSFER") return <ArrowRightLeft className="w-4 h-4 text-indigo-400" />;
    return <ArrowDownRight className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header toolbar */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div>
          <h2 className="text-sm font-bold text-[#FAFAFA] tracking-wide uppercase">All Transactions</h2>
          <p className="text-[10px] text-[#A1A1AA]">Manage, edit, or filter your income and expenses</p>
        </div>
        
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all flex items-center gap-1.5 neon-glow-primary cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#18181B] border border-[#27272A] rounded-xl p-4">
        
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchant, notes, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] placeholder-[#A1A1AA] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="EXPENSE">Expenses</option>
            <option value="INCOME">Income</option>
            <option value="TRANSFER">Transfers</option>
            <option value="BILL">Bills</option>
            <option value="SUBSCRIPTION">Subscriptions</option>
            <option value="INVESTMENT">Investments</option>
            <option value="SAVINGS">Savings</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Groceries">Groceries</option>
            <option value="Food">Food & Dining</option>
            <option value="Bills">Bills & Utilities</option>
            <option value="Subscription">Subscriptions</option>
            <option value="Salary">Salary & Income</option>
            <option value="Investment">Investments</option>
            <option value="Savings">Savings</option>
            <option value="Transport">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>

      </div>

      {/* TRANSACTIONS GRID / TABLE */}
      <div className="glass-panel border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#27272A] bg-zinc-900/35 text-[#A1A1AA] font-bold uppercase tracking-wider">
                <th className="p-4">Activity</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-xs text-[#A1A1AA]">
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-800/25 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-[#27272A] flex items-center justify-center">
                            {getTxIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#FAFAFA]">{tx.merchant}</p>
                            {tx.notes && (
                              <span className="text-[10px] text-[#A1A1AA] block truncate max-w-[200px] mt-0.5">{tx.notes}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-[#FAFAFA]">{tx.category}</td>
                      <td className="p-4 text-[#A1A1AA]">
                        {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className={`p-4 text-right font-extrabold ${isIncome ? 'text-emerald-400' : 'text-[#FAFAFA]'}`}>
                        {isIncome ? "+" : "-"} Rp{tx.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={isPending}
                            className="p-1.5 rounded bg-red-950/20 hover:bg-red-500/20 text-red-400 transition-colors border border-transparent hover:border-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL DIALOG */}
      {isEditOpen && selectedTx && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-panel border border-[#27272A] rounded-2xl p-6 shadow-2xl relative animate-slide-up">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-800 text-[#A1A1AA]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-indigo-400 mb-6 uppercase tracking-wider">Edit Transaction</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Merchant</label>
                  <input
                    type="text"
                    value={selectedTx.merchant}
                    onChange={(e) => setSelectedTx({ ...selectedTx, merchant: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Amount (Rp)</label>
                  <input
                    type="number"
                    value={selectedTx.amount}
                    onChange={(e) => setSelectedTx({ ...selectedTx, amount: Number(e.target.value) })}
                    className="input-premium py-2 px-3 text-xs w-full text-emerald-400 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Category</label>
                  <select
                    value={selectedTx.category}
                    onChange={(e) => setSelectedTx({ ...selectedTx, category: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Bills">Bills & Utilities</option>
                    <option value="Subscription">Subscriptions</option>
                    <option value="Salary">Salary & Income</option>
                    <option value="Investment">Investments</option>
                    <option value="Savings">Savings</option>
                    <option value="Transport">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Date</label>
                  <input
                    type="date"
                    value={selectedTx.date}
                    onChange={(e) => setSelectedTx({ ...selectedTx, date: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Tx Type</label>
                  <select
                    value={selectedTx.type}
                    onChange={(e) => setSelectedTx({ ...selectedTx, type: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="BILL">Bill</option>
                    <option value="SUBSCRIPTION">Subscription</option>
                    <option value="INVESTMENT">Investment</option>
                    <option value="SAVINGS">Savings</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={selectedTx.tags}
                    onChange={(e) => setSelectedTx({ ...selectedTx, tags: e.target.value })}
                    placeholder="e.g. food, daily"
                    className="input-premium py-2 px-3 text-xs w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Notes</label>
                <textarea
                  value={selectedTx.notes || ""}
                  onChange={(e) => setSelectedTx({ ...selectedTx, notes: e.target.value })}
                  className="input-premium py-2 px-3 text-xs w-full h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 neon-glow-primary disabled:opacity-55"
              >
                {isPending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MANUAL ENTRY MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-panel border border-[#27272A] rounded-2xl p-6 shadow-2xl relative animate-slide-up">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-800 text-[#A1A1AA]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-indigo-400 mb-6 uppercase tracking-wider">Manual Log</h3>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Merchant</label>
                  <input
                    type="text"
                    placeholder="Starbucks"
                    value={newTxData.merchant}
                    onChange={(e) => setNewTxData({ ...newTxData, merchant: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Amount (Rp)</label>
                  <input
                    type="number"
                    placeholder="35000"
                    value={newTxData.amount || ""}
                    onChange={(e) => setNewTxData({ ...newTxData, amount: Number(e.target.value) })}
                    className="input-premium py-2 px-3 text-xs w-full text-emerald-400 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Category</label>
                  <select
                    value={newTxData.category}
                    onChange={(e) => setNewTxData({ ...newTxData, category: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Bills">Bills & Utilities</option>
                    <option value="Subscription">Subscriptions</option>
                    <option value="Salary">Salary & Income</option>
                    <option value="Investment">Investments</option>
                    <option value="Savings">Savings</option>
                    <option value="Transport">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Date</label>
                  <input
                    type="date"
                    value={newTxData.date}
                    onChange={(e) => setNewTxData({ ...newTxData, date: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Tx Type</label>
                  <select
                    value={newTxData.type}
                    onChange={(e) => setNewTxData({ ...newTxData, type: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="BILL">Bill</option>
                    <option value="SUBSCRIPTION">Subscription</option>
                    <option value="INVESTMENT">Investment</option>
                    <option value="SAVINGS">Savings</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="coffee, daily"
                    value={newTxData.tags}
                    onChange={(e) => setNewTxData({ ...newTxData, tags: e.target.value })}
                    className="input-premium py-2 px-3 text-xs w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Notes</label>
                <textarea
                  placeholder="Vanilla Latte..."
                  value={newTxData.notes}
                  onChange={(e) => setNewTxData({ ...newTxData, notes: e.target.value })}
                  className="input-premium py-2 px-3 text-xs w-full h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 neon-glow-primary disabled:opacity-55"
              >
                {isPending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Log Transaction</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
