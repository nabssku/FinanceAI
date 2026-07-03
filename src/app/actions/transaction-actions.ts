'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;

// Get transactions list with filters
export async function getTransactions(filters: {
  search?: string;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
} = {}) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const where: any = { userId };

  if (filters.type && filters.type !== "ALL") {
    where.type = filters.type;
  }

  if (filters.category && filters.category !== "ALL") {
    where.category = filters.category;
  }

  if (filters.search) {
    where.OR = [
      { merchant: { contains: filters.search, mode: "insensitive" } },
      { category: { contains: filters.search, mode: "insensitive" } },
      { notes: { contains: filters.search, mode: "insensitive" } }
    ];
  }

  if (filters.minAmount) {
    where.amount = { gte: Number(filters.minAmount) };
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  return await db.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      receipt: true,
      splitBill: {
        include: {
          friendsShares: {
            include: {
              friend: true
            }
          }
        }
      }
    }
  });
}

// Create transaction manually
export async function createTransaction(data: {
  type: string;
  merchant: string;
  amount: number;
  date: Date;
  category: string;
  notes?: string;
  tags?: string[];
}) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const tx = await db.transaction.create({
    data: {
      userId,
      type: data.type as any,
      merchant: data.merchant,
      amount: data.amount,
      date: new Date(data.date),
      category: data.category,
      notes: data.notes || "",
      tags: data.tags || []
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return tx;
}

// Update transaction
export async function updateTransaction(id: string, data: any) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const existing = await db.transaction.findUnique({
    where: { id }
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Transaction not found");
  }

  const tx = await db.transaction.update({
    where: { id },
    data: {
      type: data.type,
      merchant: data.merchant,
      amount: Number(data.amount),
      date: new Date(data.date),
      category: data.category,
      notes: data.notes,
      tags: data.tags
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return tx;
}

// Delete transaction
export async function deleteTransaction(id: string) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const existing = await db.transaction.findUnique({
    where: { id }
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Transaction not found");
  }

  await db.transaction.delete({
    where: { id }
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

// Fetch dashboard statistics
export async function getDashboardStats() {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const transactions = await db.transaction.findMany({
    where: { userId }
  });

  // Calculations
  let currentBalance = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let totalSavings = 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;

    if (tx.type === "INCOME") {
      currentBalance += tx.amount;
      if (isCurrentMonth) monthlyIncome += tx.amount;
    } else if (
      tx.type === "EXPENSE" || 
      tx.type === "BILL" || 
      tx.type === "SUBSCRIPTION" || 
      tx.type === "SPLIT_BILL"
    ) {
      currentBalance -= tx.amount;
      if (isCurrentMonth) monthlyExpense += tx.amount;
    } else if (tx.type === "SAVINGS" || tx.type === "INVESTMENT") {
      currentBalance -= tx.amount; // Moves from liquid balance to investments/savings
      if (isCurrentMonth) totalSavings += tx.amount;
    } else if (tx.type === "TRANSFER") {
      // Internal transfers do not change total balance unless to outward friends
    }
  });

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  transactions
    .filter(tx => {
      const txDate = new Date(tx.date);
      return (
        txDate.getMonth() === currentMonth && 
        txDate.getFullYear() === currentYear &&
        ["EXPENSE", "BILL", "SUBSCRIPTION", "SPLIT_BILL"].includes(tx.type)
      );
    })
    .forEach(tx => {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
    });

  const breakdown = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }));

  // Budget progress
  const budgets = await db.budget.findMany({
    where: {
      userId,
      month: currentMonth + 1,
      year: currentYear
    }
  });

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  // Cash flow (last 6 months)
  const cashFlow: any[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    
    let inc = 0;
    let exp = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === month && txDate.getFullYear() === year) {
        if (tx.type === "INCOME") inc += tx.amount;
        if (["EXPENSE", "BILL", "SUBSCRIPTION", "SPLIT_BILL"].includes(tx.type)) exp += tx.amount;
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    cashFlow.push({
      month: monthNames[month],
      income: inc,
      expense: exp
    });
  }

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Upcoming bills (simulated or flagged as BILL/SUBSCRIPTION with dates in current month)
  const upcomingBills = transactions
    .filter(tx => (tx.type === "BILL" || tx.type === "SUBSCRIPTION") && new Date(tx.date).getDate() >= new Date().getDate())
    .slice(0, 3)
    .map(tx => ({
      id: tx.id,
      merchant: tx.merchant,
      amount: tx.amount,
      dueDate: new Date(new Date().setDate(new Date(tx.date).getDate())).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      category: tx.category
    }));

  return {
    currentBalance,
    monthlyIncome,
    monthlyExpense,
    totalSavings,
    budgetLimit: totalBudgetLimit,
    budgetSpent: totalBudgetSpent,
    breakdown,
    cashFlow,
    recentTransactions,
    upcomingBills
  };
}

// Generate Intelligent AI Insights
export async function getAIInsights() {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const transactions = await db.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" }
  });

  if (transactions.length === 0) {
    return [
      "Welcome to FinanceAI! Add your first transactions to receive personalized, intelligent financial summaries.",
      "Track expenses quickly by speaking naturally: 'I spent Rp45.000 on lunch'."
    ];
  }

  // Collect some metadata
  let foodTotal = 0;
  let coffeeTotal = 0;
  let billsTotal = 0;
  
  transactions.forEach(tx => {
    if (tx.category === "Food") foodTotal += tx.amount;
    if (tx.merchant.toLowerCase().includes("coffee") || tx.merchant.toLowerCase().includes("kopi")) {
      coffeeTotal += tx.amount;
    }
    if (tx.type === "BILL") billsTotal += tx.amount;
  });

  if (groqApiKey) {
    try {
      const groq = new Groq({ apiKey: groqApiKey });
      const prompt = `Berdasarkan ringkasan transaksi keuangan berikut, hasilkan 4 poin analisis keuangan yang ringkas, bernilai tinggi, bergaya startup/bisnis modern dalam Bahasa Indonesia. Jangan sertakan judul/header.
      Ringkasan:
      - Total transaksi dicatat: ${transactions.length}
      - Pengeluaran kategori Makanan: Rp${foodTotal.toLocaleString('id-ID')}
      - Pengeluaran Kopi/Coffee: Rp${coffeeTotal.toLocaleString('id-ID')}
      - Pembayaran tagihan: Rp${billsTotal.toLocaleString('id-ID')}
      - Merchant terakhir: ${transactions[0]?.merchant || "Tidak ada"}
      
      Format output: Array string dalam JSON. Contoh: {"insights": ["Analisis 1", "Analisis 2"]}`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
      if (parsed.insights && Array.isArray(parsed.insights)) {
        return parsed.insights;
      }
    } catch (err) {
      console.error("Groq insights generation failed, falling back to rule-based:", err);
    }
  }

  // Local rule-based fallback insights
  const insights = [
    `Anda mencatat ${transactions.length} transaksi pada periode ini. Pengeluaran terbesar Anda adalah untuk ${transactions.sort((a, b) => b.amount - a.amount)[0]?.merchant || "Merchant Umum"}.`,
    foodTotal > 0 
      ? `Total pengeluaran makan/kuliner Anda adalah Rp${foodTotal.toLocaleString('id-ID')}, yang merupakan bagian utama dari aliran kas keluar bulanan.`
      : "Anda belum mencatat pengeluaran makanan. Coba tulis 'Beli burger Rp45.000'.",
    coffeeTotal > 0
      ? `Pelacak Kopi: Anda menghabiskan Rp${coffeeTotal.toLocaleString('id-ID')} untuk kafein bulan ini. Pengeluaran kecil harian dapat menumpuk!`
      : "Pengeluaran kopi terkendali: Anda menghabiskan Rp0 untuk kopi bulan ini.",
    "Proyeksi menunjukkan Anda berada di jalur yang tepat untuk menyisihkan sebagian pendapatan bulan ini. Pertahankan!"
  ];

  return insights;
}
