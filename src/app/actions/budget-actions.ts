'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Get monthly budgets for current month
export async function getBudgets(month?: number, year?: number) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";
  
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();

  // 1. Fetch budgets configured
  const budgets = await db.budget.findMany({
    where: { userId, month: m, year: y }
  });

  // 2. Fetch all expenses logged in this month to double check current spent values
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      type: { in: ["EXPENSE", "BILL", "SUBSCRIPTION", "SPLIT_BILL"] }
    },
    include: { splitBill: true }
  });

  const categoryExpenses: Record<string, number> = {};
  transactions.forEach((tx: any) => {
    const txDate = new Date(tx.date);
    if (txDate.getMonth() + 1 === m && txDate.getFullYear() === y) {
      const amount = tx.type === "SPLIT_BILL" && tx.splitBill
        ? tx.splitBill.userShare
        : tx.amount;
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + amount;
    }
  });

  // 3. Map or create updated results to make sure 'spent' values are exact
  const items = budgets.map((b: any) => ({
    ...b,
    spent: categoryExpenses[b.category] || 0
  }));

  return items;
}

// Upsert category budget
export async function saveBudget(category: string, limit: number, month?: number, year?: number) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";
  
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();

  // Compute current spent
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      category,
      type: { in: ["EXPENSE", "BILL", "SUBSCRIPTION", "SPLIT_BILL"] }
    },
    include: { splitBill: true }
  });

  let spent = 0;
  transactions.forEach((tx: any) => {
    const txDate = new Date(tx.date);
    if (txDate.getMonth() + 1 === m && txDate.getFullYear() === y) {
      const amount = tx.type === "SPLIT_BILL" && tx.splitBill
        ? tx.splitBill.userShare
        : tx.amount;
      spent += amount;
    }
  });

  // Upsert budget
  const budget = await db.budget.upsert({
    where: {
      userId_category_month_year: {
        userId,
        category,
        month: m,
        year: y
      }
    },
    update: {
      limit: Number(limit),
      spent
    },
    create: {
      userId,
      category,
      limit: Number(limit),
      spent,
      month: m,
      year: y
    }
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return budget;
}

// Delete budget
export async function deleteBudget(id: string) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const existing = await db.budget.findUnique({
    where: { id }
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Budget not found");
  }

  await db.budget.delete({
    where: { id }
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

// Recalculate spent value for a specific budget and update it in the database
export async function recalculateBudgetSpent(
  userId: string,
  category: string,
  month: number,
  year: number
) {
  // 1. Fetch all transactions for this user, category, month, and year that count as expenses
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      category,
      type: { in: ["EXPENSE", "BILL", "SUBSCRIPTION", "SPLIT_BILL"] }
    },
    include: { splitBill: true }
  });

  let spent = 0;
  transactions.forEach((tx: any) => {
    const txDate = new Date(tx.date);
    if (txDate.getMonth() + 1 === month && txDate.getFullYear() === year) {
      const amount = tx.type === "SPLIT_BILL" && tx.splitBill
        ? tx.splitBill.userShare
        : tx.amount;
      spent += amount;
    }
  });

  // 2. Find the budget for this category, month, and year
  const budget = await db.budget.findUnique({
    where: {
      userId_category_month_year: {
        userId,
        category,
        month,
        year
      }
    }
  });

  // 3. Update or create the budget spent amount
  if (budget) {
    const updated = await db.budget.update({
      where: { id: budget.id },
      data: { spent }
    });

    // Check if limit exceeded and trigger notification if not already notified
    if (spent > budget.limit) {
      // Find if we already sent a notification for this month/category
      const existingNotification = await db.notification.findFirst({
        where: {
          userId,
          title: `Batas Anggaran Terlewati: ${category}`,
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59)
          }
        }
      });

      if (!existingNotification) {
        await db.notification.create({
          data: {
            userId,
            title: `Batas Anggaran Terlewati: ${category}`,
            content: `Pengeluaran Anda di kategori "${category}" telah mencapai Rp${spent.toLocaleString('id-ID')}, melebihi batas anggaran Rp${budget.limit.toLocaleString('id-ID')} untuk bulan ini.`,
            type: "BUDGET_EXCEEDED"
          }
        });
      }
    }
    return updated;
  }
  return null;
}
